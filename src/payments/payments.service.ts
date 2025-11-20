// src/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual  } from 'typeorm';
import { Payment } from './payments.entity';
import { CreatePaymentDto } from 'src/validators/paymes.validator';
import { UpdatePaymentDto } from 'src/validators/paymes.validator';
import { isActiveItemStatus } from 'src/isactive';
import { PaymentsGateway } from './payments.getway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
     private paymentsGateway: PaymentsGateway, // 🔹 qo‘shildi
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepo.create(dto);
    return this.paymentRepo.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepo.find({ relations: ['order', 'user'] });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    const updated = Object.assign(payment, dto);
    return this.paymentRepo.save(updated);
  }

  async getUserSales(userId: number): Promise<any> {
  // 3 kun oldingi sanani hisoblash
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const payments = await this.paymentRepo.find({
    where: {
      paidBy: userId,
      createdAt: MoreThanOrEqual(threeDaysAgo), // faqat so‘nggi 3 kunlik to‘lovlar
    },
    relations: ['order', 'order.items', 'order.items.product', 'order.table'],
    order: { createdAt: 'DESC' },
  });

  const formatted = payments.map((payment) => {
    const validItems = (payment.order.items || []).filter(i => isActiveItemStatus(i.status));

    const items = validItems.map((item) => {
      const qty = Number(item.quantity ?? 0);
      const line = Number(item.price ?? 0);
      const unitFromLine = qty > 0 ? line / qty : 0;
      const fallbackUnit = Number(item.product?.price ?? 0);
      const unitPrice = unitFromLine > 0 ? unitFromLine : fallbackUnit;

      return {
        productName: item.product?.name ?? 'N/A',
        unitPrice,
        quantity: qty,
        total: line > 0 ? line : unitPrice * qty,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.total, 0);
    const serviceFee = Number(payment.serviceFee ?? 0);

    return {
      paymentId: payment.id,
      orderId: payment.order.id,
      table: payment.order.table?.table_number || 'Nomaʼlum',
      orderTime: payment.order.createdAt,
      paidAt: payment.createdAt,
      items,
      totalAmount,
      serviceFee,
      paidAmount: Number(payment.total ?? totalAmount + serviceFee),
    };
  });

  return { payments: formatted };
}

async getTotalSalesUntilToday(): Promise<number> {
  // bugungi kunni soat 23:59 ga qo‘yib olamiz
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const { total } = await this.paymentRepo
    .createQueryBuilder('payment')
    .select('SUM(payment.total)', 'total')
    .where('payment.createdAt <= :now', { now })
    .getRawOne();

  return parseFloat(total) || 0;
}


    async printCheck(paymentId: number) {
    const checkData = await this.getCheckByPaymentId(paymentId);
    this.paymentsGateway.sendNewCheck(checkData); // 🔹 printerlarga yuborish
    return { message: '✅ Chek printerga yuborildi!', checkData };
  }
  
  async getUserDailySales(
    userId: number,
    date: string,
  ): Promise<{
    total: number;
    bonus: number;
    byPaymentType: { cash: number; card: number };
  }> {
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
  
    // Jami summa
    const { total } = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.total)', 'total')
      .where('payment.paidBy = :userId', { userId })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      })
      .getRawOne();
  
    // To'lov turlari bo'yicha (cash va card)
    const paymentsByType = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('payment.paymentType', 'type')
      .addSelect('SUM(payment.total)', 'sum')
      .where('payment.paidBy = :userId', { userId })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      })
      .groupBy('payment.paymentType')
      .getRawMany();
  
    // Ajratilgan summalarni obyektga yig'ish
    const byPaymentType = {
      cash: 0,
      card: 0,
    };
  
    for (const row of paymentsByType) {
      const type = row.type?.toLowerCase();
      const sum = parseFloat(row.sum) || 0;
      if (type === 'cash') {
        byPaymentType.cash = sum;
      } else if (type === 'card') {
        byPaymentType.card = sum;
      }
    }
  
    const parsedTotal = parseFloat(total) || 0;
    const bonus = parsedTotal * 0.1;
  
    return {
      total: parsedTotal,
      bonus: parseFloat(bonus.toFixed(2)),
      byPaymentType,
    };
  }
  

async getAllWaitersSales(): Promise<{ name: string; total: number }[]> {
  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .leftJoin('payment.user', 'user') // paidBy orqali userga join
    .select('user.name', 'name') // yoki user.fullName
    .addSelect('SUM(payment.total)', 'total')
    .groupBy('user.name')
    .getRawMany();

  return result.map((r) => ({
    name: r.name,
    total: parseFloat(r.total) || 0,
  }));
}



async getSalesBetweenDates(from: Date, to: Date): Promise<number> {
  const { total } = await this.paymentRepo
    .createQueryBuilder('payment')
    .select('SUM(payment.total)', 'total')
    .where('payment.createdAt BETWEEN :from AND :to', { from, to })
    .getRawOne();

  return parseFloat(total) || 0;
}

async getCheckByPaymentId(paymentId: number): Promise<any> {
  const payment = await this.paymentRepo.findOne({
    where: { id: paymentId },
    relations: ['order', 'order.table', 'order.items', 'order.items.product', 'user'], // 👈 user qo‘shildi
  });

  if (!payment) {
    throw new NotFoundException('Payment not found');
  }

  const order = payment.order;

  // canceled bo‘lmagan itemlar
  const validItems = (order.items || []).filter((item) => {
    const st = (item.status || '').toString().trim().toLowerCase();
    return st !== 'canceled' && st !== 'cancelled';
  });

const items = validItems.map((item) => {
  const qty = Number(item.quantity ?? 0);
  const line = Number(item.price ?? 0);
  const unitFromLine = qty > 0 ? line / qty : 0;
  const fallbackUnit = Number(item.product?.price ?? 0);
  const unitPrice = unitFromLine > 0 ? unitFromLine : fallbackUnit;

  return {
    productName: item.product?.name ?? 'N/A',
    unitType: item.product?.unitType ?? 'piece',  // 👈 qo‘shildi
    unitPrice,
    quantity: qty,
    total: line > 0 ? line : unitPrice * qty,
  };
});


const totalAmount = items.reduce((acc, cur) => acc + cur.total, 0);

// Agar isTakeaway = true bo‘lsa, xizmat haqi 0 bo‘ladi
const serviceFee =
  payment.order.isTakeaway
    ? 0
    : payment.serviceFee != null
      ? Number(payment.serviceFee)
      : Math.round((totalAmount * 10) / 100);

const paidAmount =
  payment.total != null ? Number(payment.total) : totalAmount + serviceFee;


  return {
    id: payment.id,
    table: order.table?.table_number ?? 'Noma’lum stol',
    orderId: order.id,
    orderTime: order.createdAt,
    items,
    totalAmount,
    serviceFee,
    paidAmount,
    paidBy: payment.paidBy,
    paidByName: payment.user?.name ?? 'Noma’lum', // 👈 foydalanuvchi ismi qo‘shildi
    paidAt: payment.createdAt,
  };
}




async getWaitersSalesForDay(date: string): Promise<
  { name: string; total: number; salary: number }[]
> {
  const from = new Date(date);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);

  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .leftJoin('payment.user', 'user')
    .select('user.name', 'name')
    .addSelect('SUM(payment.total)', 'total')
    .where('payment.createdAt BETWEEN :from AND :to', { from, to })
    .groupBy('user.name')
    .getRawMany();

  return result.map((r) => {
    const total = parseFloat(r.total) || 0;
    const salary = +(total * 0.1).toFixed(2); // 10% ish haqi
    return {
      name: r.name,
      total,
      salary,
    };
  });
}


async getSalesByCategory(): Promise<{ category: string; total: number }[]> {
  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .leftJoin('payment.order', 'order')
    .leftJoin('order.items', 'item')
    .leftJoin('item.product', 'product')
    .leftJoin('product.category', 'category') // JOIN category
    .select('category.name', 'category') // name ni olish
    .addSelect('SUM(item.price * item.quantity)', 'total')
    .groupBy('category.name')
    .getRawMany();

  return result.map((r) => ({
    category: r.category,
    total: parseFloat(r.total) || 0,
  }));
}


async getDailySalesInRange(from: string, to: string): Promise<{ date: string; total: number }[]> {
  const startDate = new Date(from);
  const endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999);

  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .select("TO_CHAR(payment.createdAt, 'YYYY-MM-DD')", 'date') // Postgres uchun
    .addSelect('SUM(payment.total)', 'total')
    .where('payment.createdAt BETWEEN :from AND :to', { from: startDate, to: endDate })
    .groupBy("TO_CHAR(payment.createdAt, 'YYYY-MM-DD')")
    .orderBy('date', 'ASC')
    .getRawMany();

  return result.map((r) => ({
    date: r.date,
    total: parseFloat(r.total) || 0,
  }));
}



  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepo.remove(payment);
  }
}
