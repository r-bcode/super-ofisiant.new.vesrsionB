// ../payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual  } from 'typeorm';
import { Payment } from './payments.entity';
import { CreatePaymentDto } from '../validators/paymes.validator';
import { UpdatePaymentDto } from '../validators/paymes.validator';
import { isActiveItemStatus } from '../isactive';
import { PaymentsGateway } from './payments.getway';
import { OrderItem } from '../order_items/order_items.entity';
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
     private paymentsGateway: PaymentsGateway, // 🔹 qo‘shildi

  @InjectRepository(OrderItem)
  private itemRepo: Repository<OrderItem>, 
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
    relations: ['order', 'order.table', 'order.items', 'order.items.product', 'user'], // ✅ comment olib tashlandi
  });

  if (!payment) {
    throw new NotFoundException('Payment not found');
  }

  const order = payment.order;

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
      unitType: item.product?.unitType ?? 'piece',
      unitPrice,
      quantity: qty,
      total: line > 0 ? line : unitPrice * qty,
    };
  });

  const totalAmount = items.reduce((acc, cur) => acc + cur.total, 0);

  const serviceFee =
    order.isTakeaway
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
    comment: order.comment ?? '', // ✅ shu kerak
    items,
    totalAmount,
    serviceFee,
    paidAmount,
    paidBy: payment.paidBy,
    paidByName: payment.user?.name ?? 'Noma’lum',
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
  const result = await this.itemRepo
    .createQueryBuilder('item')
    .leftJoin('item.product', 'product')
    .leftJoin('product.category', 'category')
    .select('category.name', 'category')
    .addSelect('SUM(item.price)', 'total') // ��� FIX SHU
    .groupBy('category.name')
    .getRawMany();

  return result.map((r) => ({
    category: r.category,
    total: Number(r.total) || 0,
  }));
}





async getDailySalesInRange(from: string, to: string) {
  const startDate = new Date(from);
  const endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999);

  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .select("TO_CHAR(payment.createdAt, 'YYYY-MM-DD')", 'date')
    .addSelect('SUM(payment.total)', 'total')
    .where('payment.createdAt BETWEEN :from AND :to', { from: startDate, to: endDate })
    .groupBy("TO_CHAR(payment.createdAt, 'YYYY-MM-DD')")
    .orderBy('date', 'ASC')
    .getRawMany();

  const map = new Map(result.map(r => [r.date, Number(r.total) || 0]));

  // from->to oralig'ida har kunni to'ldirish
  const out: { date: string; total: number }[] = [];
  const cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);

  const last = new Date(endDate);
  last.setHours(0, 0, 0, 0);

  while (cur <= last) {
    const key = cur.toISOString().slice(0, 10);
    out.push({ date: key, total: map.get(key) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }

  return out;
}





  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepo.remove(payment);
  }

  async getWaiterEfficiency(from?: string, to?: string): Promise<{
    name: string;
    totalOrders: number;
    totalSales: number;
    avgServiceMinutes: number;
    bonus: number;
  }[]> {
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();
    endDate.setHours(23, 59, 59, 999);
  
    const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .leftJoin('payment.user', 'user')
    .leftJoin('payment.order', 'order')
    .select('user.name', 'name')
    .addSelect('COUNT(DISTINCT payment.id)', 'totalOrders')
    .addSelect('SUM(payment.total)', 'totalSales')
    .addSelect(`
      AVG(
        EXTRACT(EPOCH FROM (payment.createdAt - order.createdAt)) / 60
      )
    `, 'avgServiceMinutes')
    .where('payment.createdAt BETWEEN :start AND :end', {
      start: startDate,
      end: endDate,
    })
    .andWhere('order.createdAt IS NOT NULL')
    .groupBy('user.name')
    .orderBy('SUM(payment.total)', 'DESC')
    .getRawMany();
     
    return result.map(r => {
      const totalSales = Math.round(Number(r.totalSales) || 0);
      return {
        name: r.name ?? 'Noma\'lum',
        totalOrders: Number(r.totalOrders) || 0,
        totalSales,
        avgServiceMinutes: r.avgServiceMinutes
          ? Math.round(Number(r.avgServiceMinutes))
          : 0,
        bonus: Math.round(totalSales * 0.1), // 10% bonus
      };
    });
  }

  async getSalesByWeekday(days = 30): Promise<
  { day: string; avgTotal: number; avgOrders: number; totalDays: number }[]
> {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .select('EXTRACT(DOW FROM payment.createdAt)::int', 'dow') // 0=Yakshanba, 1=Dushanba...
    .addSelect('SUM(payment.total)', 'totalSum')
    .addSelect('COUNT(payment.id)', 'totalOrders')
    .addSelect(
      `COUNT(DISTINCT TO_CHAR(payment.createdAt, 'YYYY-MM-DD'))`,
      'totalDays'
    )
    .where('payment.createdAt >= :from', { from })
    .groupBy('EXTRACT(DOW FROM payment.createdAt)::int')
    .orderBy('dow', 'ASC')
    .getRawMany();

  // PostgreSQL: 0=Yakshanba, 1=Dushanba ... 6=Shanba
  const dayNames = [
    'Yakshanba',
    'Dushanba',
    'Seshanba',
    'Chorshanba',
    'Payshanba',
    'Juma',
    'Shanba',
  ];

  const map = new Map(result.map(r => [Number(r.dow), r]));

  // Dushanbadan boshlaymiz (1→6→0)
  const order = [1, 2, 3, 4, 5, 6, 0];

  return order.map(dow => {
    const row = map.get(dow);
    const totalDays = Number(row?.totalDays) || 1;
    return {
      day: dayNames[dow],
      avgTotal: row ? Math.round(Number(row.totalSum) / totalDays) : 0,
      avgOrders: row ? Math.round(Number(row.totalOrders) / totalDays) : 0,
      totalDays: row ? totalDays : 0,
    };
  });
}

async compareTodayVsYesterday(): Promise<{
  today: number;
  yesterday: number;
  diffAmount: number;
  diffPercent: number;
  trend: 'up' | 'down' | 'same';
}> {
  const now = new Date();

  // Bugun: 00:00 → hozirgi vaqt
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Kecha: 00:00 → xuddi hozirgi soat/daqiqa
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayUntilSameTime = new Date(now);
  yesterdayUntilSameTime.setDate(yesterdayUntilSameTime.getDate() - 1);

  const [todayResult, yesterdayResult] = await Promise.all([
    this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.total)', 'total')
      .where('payment.createdAt BETWEEN :start AND :end', {
        start: todayStart,
        end: now,
      })
      .getRawOne(),

    this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.total)', 'total')
      .where('payment.createdAt BETWEEN :start AND :end', {
        start: yesterdayStart,
        end: yesterdayUntilSameTime, // ✅ xuddi shu soatgacha
      })
      .getRawOne(),
  ]);

  const today = Math.round(Number(todayResult?.total) || 0);
  const yesterday = Math.round(Number(yesterdayResult?.total) || 0);
  const diffAmount = today - yesterday;
  const diffPercent = yesterday > 0
    ? Math.round((diffAmount / yesterday) * 100)
    : 100;

  return {
    today,
    yesterday,
    diffAmount,
    diffPercent,
    trend: diffAmount > 0 ? 'up' : diffAmount < 0 ? 'down' : 'same',
  };
}

async getAverageCheckByDay(from: string, to: string) {
  const startDate = new Date(from + 'T00:00:00');      // ✅ local time
  const endDate = new Date(to + 'T23:59:59.999');      // ✅ local time

  const result = await this.paymentRepo
    .createQueryBuilder('payment')
    .select("TO_CHAR(payment.createdAt AT TIME ZONE 'Asia/Tashkent', 'YYYY-MM-DD')", 'date')  // ✅ Toshkent vaqti
    .addSelect('SUM(payment.total)', 'totalSales')
    .addSelect('COUNT(payment.id)', 'ordersCount')
    .addSelect('AVG(payment.total)', 'avgCheck')
    .where('payment.createdAt BETWEEN :from AND :to', { from: startDate, to: endDate })
    .groupBy("TO_CHAR(payment.createdAt AT TIME ZONE 'Asia/Tashkent', 'YYYY-MM-DD')")
    .orderBy('date', 'ASC')
    .getRawMany();

  const map = new Map(result.map(r => [r.date, r]));

  const out: { date: string; totalSales: number; ordersCount: number; avgCheck: number }[] = [];
  const cur = new Date(from + 'T00:00:00');            // ✅ local time
  const last = new Date(to + 'T00:00:00');             // ✅ local time

  while (cur <= last) {
    // ✅ local date → string (toISOString emas!)
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const row = map.get(key);
    out.push({
      date: key,
      totalSales: row ? Math.round(Number(row.totalSales)) : 0,
      ordersCount: row ? Number(row.ordersCount) : 0,
      avgCheck: row ? Math.round(Number(row.avgCheck)) : 0,
    });
    cur.setDate(cur.getDate() + 1);
  }

  return out;
}

async getAverageSalesByHour(days = 30): Promise<
{ hour: number; avgTotal: number; avgOrders: number }[]
> {
const from = new Date();
from.setDate(from.getDate() - days);
from.setHours(0, 0, 0, 0);

const result = await this.paymentRepo
  .createQueryBuilder('payment')
  .select('EXTRACT(HOUR FROM payment.createdAt)::int', 'hour')
  .addSelect('SUM(payment.total)', 'totalSum')
  .addSelect('COUNT(payment.id)', 'totalOrders')
  .addSelect(
    `COUNT(DISTINCT TO_CHAR(payment.createdAt, 'YYYY-MM-DD'))`,
    'activeDays', // o'sha soatda hech bo'lmasa 1 ta to'lov bo'lgan kunlar soni
  )
  .where('payment.createdAt >= :from', { from })
  .groupBy('EXTRACT(HOUR FROM payment.createdAt)::int')
  .orderBy('hour', 'ASC')
  .getRawMany();

const map = new Map(result.map(r => [Number(r.hour), r]));

return Array.from({ length: 24 }, (_, i) => {
  const row = map.get(i);
  const activeDays = Number(row?.activeDays) || 1;
  return {
    hour: i,
    avgTotal: row ? Math.round(Number(row.totalSum) / activeDays) : 0,
    avgOrders: row ? Math.round(Number(row.totalOrders) / activeDays) : 0,
  };
});
}

}
