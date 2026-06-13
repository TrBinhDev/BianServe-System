import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './shared/errors/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import accountRoutes from './modules/accounts/accounts.routes';
import tableRoutes from './modules/tables/tables.routes';
import qrRoutes from './modules/qr/qr.routes';
import categoryRoutes from './modules/categories/categories.routes';
import productRoutes from './modules/products/products.routes';
import orderRoutes, { adminOrderRouter } from './modules/orders/orders.routes';
import promotionRoutes, { adminPromotionRouter } from './modules/promotions/promotions.routes';
import statisticsRoutes from './modules/statistics/statistics.routes';
import feedbackRoutes, { adminFeedbackRouter } from './modules/feedbacks/feedbacks.routes';
import { getMenu } from './modules/products/products.controller';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Auth
app.use('/api/auth', authRoutes);

// Admin
app.use('/api/admin/accounts', accountRoutes);
app.use('/api/admin/tables', tableRoutes);
app.use('/api/admin/tables/:id/qr', qrRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/orders', adminOrderRouter);
app.use('/api/admin/promotions', adminPromotionRouter);
app.use('/api/admin/statistics', statisticsRoutes);
app.use('/api/admin/feedbacks', adminFeedbackRouter);

// Public
app.get('/api/menu', getMenu);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/feedbacks', feedbackRoutes);

app.use(errorHandler);

export default app;
