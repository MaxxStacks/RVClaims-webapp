import { type Contact, type InsertContact, type NetworkWaitlist, type InsertNetworkWaitlist } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  createNetworkWaitlist(waitlist: InsertNetworkWaitlist): Promise<NetworkWaitlist>;
  getNetworkWaitlist(): Promise<NetworkWaitlist[]>;
}

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private networkWaitlist: Map<string, NetworkWaitlist>;

  constructor() {
    this.contacts = new Map();
    this.networkWaitlist = new Map();
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
      ...insertWaitlist,
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
}

export const storage = new MemStorage();
