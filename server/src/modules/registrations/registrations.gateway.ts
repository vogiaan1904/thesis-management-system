import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

@WebSocketGateway({
  namespace: 'registrations',
  cors: { origin: '*' },
})
export class RegistrationsGateway {
  constructor(private prisma: PrismaService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe-topic')
  async handleSubscribeTopic(
    @ConnectedSocket() client: Socket,
    @MessageBody() topicId: string,
  ) {
    client.join(`topic-${topicId}`);

    // Send current slot availability
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (topic) {
      client.emit('slots-update', {
        topicId,
        available: topic.maxStudents - topic.currentStudents,
        total: topic.maxStudents,
      });
    }
  }

  @SubscribeMessage('unsubscribe-topic')
  handleUnsubscribeTopic(
    @ConnectedSocket() client: Socket,
    @MessageBody() topicId: string,
  ) {
    client.leave(`topic-${topicId}`);
  }

  // Called when instructor accepts/denies
  notifyStatusChange(registration: any) {
    // Notify the specific student
    this.server.emit(`student-${registration.studentId}`, {
      type: 'status-change',
      registrationId: registration.id,
      newStatus: registration.status,
      instructorComment: registration.instructorComment,
    });

    // Update slot count for all subscribers
    if (
      registration.status === RegistrationStatus.INSTRUCTOR_ACCEPTED &&
      registration.topic
    ) {
      this.server.to(`topic-${registration.topicId}`).emit('slots-update', {
        topicId: registration.topicId,
        available: registration.topic.maxStudents - registration.topic.currentStudents,
        total: registration.topic.maxStudents,
      });
    }
  }

  // Called when new application is submitted
  notifyNewApplication(registration: any) {
    // Notify instructor
    if (registration.topic && registration.topic.instructorId) {
      this.server.emit(`instructor-${registration.topic.instructorId}`, {
        type: 'new-application',
        registrationId: registration.id,
        studentName: registration.student.fullName,
        studentId: registration.student.userId,
        topicCode: registration.topic.topicCode,
        topicTitle: registration.topic.titleVn,
      });
    }
  }

  // Called when verification is complete
  notifyVerificationComplete(registration: any) {
    // Notify student
    this.server.emit(`student-${registration.studentId}`, {
      type: 'verification-complete',
      registrationId: registration.id,
      status: registration.status,
      creditsVerified: registration.creditsVerified,
    });

    // Notify instructor
    if (registration.topic && registration.topic.instructorId) {
      this.server.emit(`instructor-${registration.topic.instructorId}`, {
        type: 'verification-complete',
        registrationId: registration.id,
        studentName: registration.student.fullName,
        status: registration.status,
      });
    }
  }
}
