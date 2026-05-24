// scripts/reconcile-assist-tables.ts — Drop & recreate assist tables to match Drizzle schema
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    // Drop all 8 tables in reverse dependency order
    const drops = [
      "assist_knowledge_gaps",
      "assist_support_tickets",
      "assist_messages",
      "assist_conversations",
      "dealer_account_managers",
      "remote_session_events",
      "remote_sessions",
      "kb_articles",
    ];
    for (const t of drops) {
      await client.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
      console.log(`Dropped: ${t}`);
    }

    // Recreate pgvector extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");

    // kb_articles — unchanged, recreate with pgvector embedding
    await client.query(`
      CREATE TABLE kb_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        tags TEXT[],
        roles_visible TEXT[] DEFAULT ARRAY['dealer_owner','dealer_staff'],
        status VARCHAR(20) DEFAULT 'published',
        author_id VARCHAR(255) NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX kb_articles_category_idx ON kb_articles(category)`);
    await client.query(`CREATE INDEX kb_articles_status_idx ON kb_articles(status)`);
    await client.query(`CREATE INDEX kb_articles_slug_idx ON kb_articles(slug)`);
    console.log("Created: kb_articles");

    // assist_conversations — matches Drizzle schema + metadata for workflow state
    await client.query(`
      CREATE TABLE assist_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dealer_id UUID NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_role VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        escalation_type VARCHAR(50),
        escalated_to VARCHAR(255),
        satisfaction_rating INTEGER,
        thumbs_up_count INTEGER DEFAULT 0,
        thumbs_down_count INTEGER DEFAULT 0,
        message_count INTEGER DEFAULT 0,
        metadata JSONB,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX assist_conv_dealer_idx ON assist_conversations(dealer_id)`);
    await client.query(`CREATE INDEX assist_conv_user_idx ON assist_conversations(user_id)`);
    await client.query(`CREATE INDEX assist_conv_status_idx ON assist_conversations(status)`);
    console.log("Created: assist_conversations");

    // assist_messages — matches Drizzle schema (metadata JSONB, not kb_article_ids array)
    await client.query(`
      CREATE TABLE assist_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        feedback VARCHAR(10),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX assist_msg_conv_idx ON assist_messages(conversation_id)`);
    console.log("Created: assist_messages");

    // assist_support_tickets — matches Drizzle schema
    await client.query(`
      CREATE TABLE assist_support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_number VARCHAR(20) NOT NULL UNIQUE,
        dealer_id UUID NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        conversation_id UUID,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        assigned_to VARCHAR(255),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX assist_ticket_dealer_idx ON assist_support_tickets(dealer_id)`);
    await client.query(`CREATE INDEX assist_ticket_status_idx ON assist_support_tickets(status)`);
    await client.query(`CREATE INDEX assist_ticket_number_idx ON assist_support_tickets(ticket_number)`);
    console.log("Created: assist_support_tickets");

    // assist_knowledge_gaps — matches Drizzle schema
    await client.query(`
      CREATE TABLE assist_knowledge_gaps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID,
        message_id UUID,
        question TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'new',
        kb_article_id UUID,
        reviewed_by VARCHAR(255),
        auto_detected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX assist_gaps_status_idx ON assist_knowledge_gaps(status)`);
    console.log("Created: assist_knowledge_gaps");

    // dealer_account_managers — matches Drizzle schema
    await client.query(`
      CREATE TABLE dealer_account_managers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dealer_id UUID NOT NULL UNIQUE,
        operator_user_id VARCHAR(255) NOT NULL,
        operator_name VARCHAR(255) NOT NULL,
        operator_email VARCHAR(255) NOT NULL,
        operator_phone VARCHAR(50),
        assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX acct_mgr_dealer_idx ON dealer_account_managers(dealer_id)`);
    console.log("Created: dealer_account_managers");

    // remote_sessions
    await client.query(`
      CREATE TABLE remote_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        access_code VARCHAR(7) NOT NULL UNIQUE,
        dealer_id UUID NOT NULL,
        dealer_user_id VARCHAR(255) NOT NULL,
        operator_user_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        takeover_granted BOOLEAN DEFAULT FALSE,
        takeover_granted_at TIMESTAMP,
        takeover_revoked_at TIMESTAMP,
        livekit_room_name VARCHAR(255),
        recording_enabled BOOLEAN DEFAULT FALSE,
        recording_url VARCHAR(500),
        code_expires_at TIMESTAMP NOT NULL,
        connected_at TIMESTAMP,
        ended_at TIMESTAMP,
        ended_by VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX remote_sessions_code_idx ON remote_sessions(access_code)`);
    await client.query(`CREATE INDEX remote_sessions_dealer_idx ON remote_sessions(dealer_id)`);
    await client.query(`CREATE INDEX remote_sessions_status_idx ON remote_sessions(status)`);
    console.log("Created: remote_sessions");

    // remote_session_events
    await client.query(`
      CREATE TABLE remote_session_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        actor VARCHAR(20) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX remote_events_session_idx ON remote_session_events(session_id)`);
    console.log("Created: remote_session_events");

    console.log("\nAll 8 tables reconciled successfully — schema matches Drizzle definitions.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
