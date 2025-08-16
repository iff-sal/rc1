import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AiChatModule } from './ai-chat/ai-chat.module'; // Import AiChatModule
import { SchedulerModule } from './scheduler/scheduler.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Department } from './departments/department.entity';
import { Service } from './services/service.entity';
import { Appointment } from './appointments/appointment.entity';
import { Document } from './documents/document.entity';
import { AiKnowledgeBase } from './ai-chat/ai-knowledge-base.entity'; // Import AiKnowledgeBase entity


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Department, Service, Appointment, Document, AiKnowledgeBase], // Include AiKnowledgeBase entity
        synchronize: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DepartmentsModule,
    ServicesModule,
    AppointmentsModule,
    DocumentsModule,
    NotificationsModule,
    AnalyticsModule,
    FeedbackModule,
    AiChatModule, // Include AiChatModule
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
