import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/sqlite';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: EntityRepository<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    await this.customerRepository.persistAndFlush(customer);
    return customer;
  }

  async update(id: string, updateCustomerDto: Partial<CreateCustomerDto>): Promise<Customer> {
    const customer = await this.findOne(id);
    this.customerRepository.assign(customer, updateCustomerDto);
    await this.customerRepository.flush();
    return customer;
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.removeAndFlush(customer);
  }
}