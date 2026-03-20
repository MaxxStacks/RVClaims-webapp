import { type Contact, type InsertContact, type NetworkWaitlist, type InsertNetworkWaitlist, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  createNetworkWaitlist(waitlist: InsertNetworkWaitlist): Promise<NetworkWaitlist>;
  getNetworkWaitlist(): Promise<NetworkWaitlist[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private networkWaitlist: Map<string, NetworkWaitlist>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.contacts = new Map();
    this.networkWaitlist = new Map();
    this.bookings = new Map();
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      language: insertContact.language || 'en',
      id,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createNetworkWaitlist(insertWaitlist: InsertNetworkWaitlist): Promise<NetworkWaitlist> {
    const id = randomUUID();
    const waitlist: NetworkWaitlist = {
      email: insertWaitlist.email,
      dealershipName: insertWaitlist.dealershipName,
      id,
      createdAt: new Date()
    };
    this.networkWaitlist.set(id, waitlist);
    return waitlist;
  }

  async getNetworkWaitlist(): Promise<NetworkWaitlist[]> {
    return Array.from(this.networkWaitlist.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      phone: insertBooking.phone ?? null,
      notes: insertBooking.notes ?? null,
      language: insertBooking.language ?? 'en',
      serviceInterest: insertBooking.serviceInterest ?? [],
      status: "pending",
      id,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
