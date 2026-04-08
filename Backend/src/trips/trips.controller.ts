import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApproveTripDto } from './dto/approve-trip.dto';
import { RejectTripDto } from './dto/reject-trip.dto';
import { AllocateTripDto } from './dto/allocate-trip.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { EarlyCompleteTripDto } from './dto/early-complete-trip.dto';
import { ConfirmTransportDto } from './dto/confirm-transport.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Trips')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new trip request',
    description:
      'Create a new trip request in DRAFT state. The trip must be submitted separately.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trip request created successfully',
    schema: {
      example: {
        id: 'uuid',
        tripType: 'Normal',
        purpose: 'Academic conference',
        destination: 'City Convention Center',
        startDateTime: '2024-01-20T09:00:00Z',
        endDateTime: '2024-01-20T17:00:00Z',
        passengerCount: 5,
        state: 'DRAFT',
        createdAt: '2024-01-15T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  create(@Body() createTripDto: CreateTripDto, @Request() req) {
    return this.tripsService.create(createTripDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trip requests' })
  @ApiResponse({ status: 200, description: 'List of trip requests' })
  findAll(@Request() req) {
    return this.tripsService.findAll(req.user.id, req.user.role);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user\'s own trips' })
  @ApiResponse({ status: 200, description: 'List of trips belonging to the authenticated user' })
  findMyTrips(@Request() req) {
    return this.tripsService.findAll(req.user.id, UserRole.User);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip request details' })
  @ApiResponse({ status: 200, description: 'Trip request details' })
  @ApiResponse({ status: 404, description: 'Trip request not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tripsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip request (draft only)' })
  @ApiResponse({
    status: 200,
    description: 'Trip request updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Can only update draft trips' })
  update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Request() req,
  ) {
    return this.tripsService.update(id, updateTripDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete draft trip',
    description: 'Permanently removes a trip that is still in DRAFT (not submitted).',
  })
  @ApiResponse({ status: 204, description: 'Draft trip deleted' })
  @ApiResponse({
    status: 400,
    description: 'Trip is not a draft',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.tripsService.remove(id, req.user);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit trip request for approval',
    description:
      'Submit a DRAFT trip for approval. Validates 48-hour advance booking requirement and starts the approval workflow.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip request submitted successfully',
    schema: {
      example: {
        id: 'uuid',
        state: 'PENDING_DEPARTMENT',
        message: 'Trip submitted for department approval',
        timeoutAt: '2024-01-17T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Trip already submitted or less than 48 hours advance',
  })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  submit(@Param('id') id: string, @Request() req) {
    return this.tripsService.submit(id, req.user);
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Approve trip request at current level',
    description:
      'Approve trip at your authorization level (Department Head, College Head, or Dean). Moves trip to next approval level or to allocation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip request approved',
    schema: {
      example: {
        id: 'uuid',
        state: 'PENDING_COLLEGE',
        message: 'Trip approved by Department Head',
        approvedBy: 'John Doe',
        approvedAt: '2024-01-16T14:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions or not your turn to approve',
  })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  approve(
    @Param('id') id: string,
    @Body() approveTripDto: ApproveTripDto,
    @Request() req,
  ) {
    return this.tripsService.approve(id, approveTripDto, req.user);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject trip request' })
  @ApiResponse({ status: 200, description: 'Trip request rejected' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  reject(
    @Param('id') id: string,
    @Body() rejectTripDto: RejectTripDto,
    @Request() req,
  ) {
    return this.tripsService.reject(id, rejectTripDto, req.user);
  }

  @Post(':id/allocate')
  @ApiOperation({ summary: 'Allocate vehicle and driver to trip' })
  @ApiResponse({ status: 200, description: 'Resources allocated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Only Deployment Team can allocate',
  })
  allocate(
    @Param('id') id: string,
    @Body() allocateTripDto: AllocateTripDto,
    @Request() req,
  ) {
    return this.tripsService.allocate(id, allocateTripDto, req.user);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel trip request' })
  @ApiResponse({ status: 200, description: 'Trip request cancelled' })
  @ApiResponse({ status: 403, description: 'Only requester can cancel' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.tripsService.cancel(id, req.user);
  }

  @Post(':id/driver-reject')
  @ApiOperation({ summary: 'Driver rejects assigned trip' })
  @ApiResponse({ status: 200, description: 'Assignment rejected, trip returned for reassignment' })
  driverReject(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    return this.tripsService.driverRejectAssignment(id, body.reason || 'No reason provided', req.user);
  }

  @Post(':id/confirm-transport')
  @ApiOperation({ summary: 'Transport office confirmation' })
  @ApiResponse({ status: 200, description: 'Transport confirmed successfully' })
  @ApiResponse({
    status: 403,
    description: 'Only Transport Office can confirm',
  })
  confirmTransport(
    @Param('id') id: string,
    @Body() confirmTransportDto: ConfirmTransportDto,
    @Request() req,
  ) {
    return this.tripsService.confirmTransport(
      id,
      confirmTransportDto,
      req.user,
    );
  }

  @Post(':id/reject-transport')
  @ApiOperation({ summary: 'Transport office rejection' })
  @ApiResponse({ status: 200, description: 'Transport rejected successfully' })
  @ApiResponse({
    status: 403,
    description: 'Only Transport Office can reject',
  })
  rejectTransport(
    @Param('id') id: string,
    @Body() rejectTransportDto: { reason: string },
    @Request() req,
  ) {
    return this.tripsService.rejectTransport(id, rejectTransportDto, req.user);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start trip' })
  @ApiResponse({ status: 200, description: 'Trip started successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid state or validation failed',
  })
  startTrip(
    @Param('id') id: string,
    @Body() startTripDto: any,
    @Request() req,
  ) {
    return this.tripsService.startTrip(id, startTripDto, req.user);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete trip' })
  @ApiResponse({ status: 200, description: 'Trip completed successfully' })
  @ApiResponse({ status: 400, description: 'Trip not in progress' })
  completeTrip(
    @Param('id') id: string,
    @Body() completeTripDto: any,
    @Request() req,
  ) {
    return this.tripsService.completeTrip(id, completeTripDto, req.user);
  }

  @Get('pending/approvals')
  @ApiOperation({
    summary: 'Get pending approvals for current user',
    description:
      'Get all trips waiting for approval at your authorization level',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending approvals',
    schema: {
      example: [
        {
          id: 'uuid',
          tripType: 'Normal',
          purpose: 'Conference',
          requester: 'Jane Smith',
          startDateTime: '2024-01-20T09:00:00Z',
          state: 'PENDING_DEPARTMENT',
          submittedAt: '2024-01-15T10:00:00Z',
          timeoutAt: '2024-01-17T10:00:00Z',
        },
      ],
    },
  })
  getPendingApprovals(@Request() req) {
    return this.tripsService.getPendingApprovals(req.user.id, req.user.role);
  }

  @Post(':id/complete-early')
  @ApiOperation({ summary: 'Complete trip early (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Trip completed early successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Transport Office or Deployment Team can complete early',
  })
  completeEarly(
    @Param('id') id: string,
    @Body() earlyCompleteTripDto: EarlyCompleteTripDto,
    @Request() req,
  ) {
    return this.tripsService.completeEarly(id, earlyCompleteTripDto, req.user);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit trip feedback' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Trip not completed or feedback already exists',
  })
  submitFeedback(
    @Param('id') id: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req,
  ) {
    return this.tripsService.submitFeedback(id, createFeedbackDto, req.user);
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get trip statistics',
    description: 'Get comprehensive statistics about all trips in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip statistics',
    schema: {
      example: {
        total: 150,
        byState: {
          DRAFT: 5,
          PENDING_DEPARTMENT: 10,
          PENDING_COLLEGE: 8,
          PENDING_PRESIDENT: 3,
          APPROVED_FOR_ALLOCATION: 2,
          CAR_ALLOCATED: 5,
          READY: 3,
          IN_PROGRESS: 4,
          COMPLETED: 100,
          CANCELLED: 7,
          REJECTED: 3,
        },
        totalFuelCost: 45000,
        totalDistance: 12500,
        completionRate: 66.7,
      },
    },
  })
  getStatistics() {
    return this.tripsService.getStatistics();
  }

  @Get('feedback/statistics')
  @ApiOperation({ summary: 'Get feedback statistics' })
  @ApiResponse({
    status: 200,
    description: 'Feedback statistics and analytics',
  })
  getFeedbackStatistics() {
    return this.tripsService.getFeedbackStatistics();
  }
}
