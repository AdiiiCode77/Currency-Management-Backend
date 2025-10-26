import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JournalService } from '../application/jounal.service';
import { CreateJournalEntryDto } from '../domain/dto/create-journal-entry.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { IsAdminGuard } from 'src/shared/guards/isAdmin.guard';

@ApiTags('Journal Entries')
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new Journal Entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createJournalEntry(@Req() req: Request, @Body() dto: CreateJournalEntryDto) {
    return await this.journalService.createJournalEntry(dto, req.adminId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all Journal Entries by Admin' })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  async getAllJournalEntries(@Req() req: Request) {
    return await this.journalService.getAllJournalEntries(req.adminId);
  }
}
