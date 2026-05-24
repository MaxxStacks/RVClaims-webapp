// scripts/migrate-assist.ts — Create DS360 Assist + Remote Support tables
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    // Ensure pgvector is enabled
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("[1/9] pgvector extension: OK");

    // kb_articles
    await client.query(`
      CREATE TABLE IF NOT EXISTS kb_articles (
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
    await client.query(`CREATE INDEX IF NOT EXISTS kb_articles_category_idx ON kb_articles(category)`);
    await client.query(`CREATE INDEX IF NOT EXISTS kb_articles_status_idx ON kb_articles(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS kb_articles_slug_idx ON kb_articles(slug)`);
    console.log("[2/9] kb_articles: OK");

    // assist_conversations
    await client.query(`
      CREATE TABLE IF NOT EXISTS assist_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dealer_id UUID NOT NULL,
        dealer_user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        escalated BOOLEAN DEFAULT FALSE,
        escalated_at TIMESTAMP,
        escalated_to VARCHAR(255),
        resolved_at TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS assist_conv_dealer_idx ON assist_conversations(dealer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS assist_conv_user_idx ON assist_conversations(dealer_user_id)`);
    console.log("[3/9] assist_conversations: OK");

    // assist_messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS assist_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        kb_article_ids TEXT[],
        tokens_used INTEGER,
        latency_ms INTEGER,
        feedback VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS assist_msg_conv_idx ON assist_messages(conversation_id)`);
    console.log("[4/9] assist_messages: OK");

    // assist_support_tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS assist_support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID,
        dealer_id UUID NOT NULL,
        dealer_user_id VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'open',
        assigned_to VARCHAR(255),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS assist_ticket_dealer_idx ON assist_support_tickets(dealer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS assist_ticket_status_idx ON assist_support_tickets(status)`);
    console.log("[5/9] assist_support_tickets: OK");

    // assist_knowledge_gaps
    await client.query(`
      CREATE TABLE IF NOT EXISTS assist_knowledge_gaps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        query TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved BOOLEAN DEFAULT FALSE,
        resolution_article_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("[6/9] assist_knowledge_gaps: OK");

    // dealer_account_managers
    await client.query(`
      CREATE TABLE IF NOT EXISTS dealer_account_managers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dealer_id UUID NOT NULL UNIQUE,
        operator_user_id VARCHAR(255) NOT NULL,
        assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("[7/9] dealer_account_managers: OK");

    // remote_sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS remote_sessions (
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
    await client.query(`CREATE INDEX IF NOT EXISTS remote_sessions_code_idx ON remote_sessions(access_code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS remote_sessions_dealer_idx ON remote_sessions(dealer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS remote_sessions_status_idx ON remote_sessions(status)`);
    console.log("[8/9] remote_sessions: OK");

    // remote_session_events
    await client.query(`
      CREATE TABLE IF NOT EXISTS remote_session_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        actor VARCHAR(20) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS remote_events_session_idx ON remote_session_events(session_id)`);
    console.log("[9/9] remote_session_events: OK");

    console.log("\nAll 8 DS360 Assist tables created successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
