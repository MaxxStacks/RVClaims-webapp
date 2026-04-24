CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" varchar(500),
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"meta_keywords" varchar(500),
	"canonical_url" varchar(500),
	"category" varchar(100) NOT NULL,
	"tags" text[],
	"target_keyword" varchar(200),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"scheduled_for" timestamp,
	"generated_by" varchar(50) DEFAULT 'anthropic',
	"prompt_template" varchar(100),
	"generation_model" varchar(50) DEFAULT 'claude-sonnet-4-20250514',
	"word_count" integer,
	"read_time_minutes" integer,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"dealership_name" text NOT NULL,
	"province" text NOT NULL,
	"service_interest" text[] DEFAULT '{}' NOT NULL,
	"scheduled_date" text NOT NULL,
	"scheduled_time" text NOT NULL,
	"notes" text,
	"language" text DEFAULT 'en',
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subject" text,
	"body_html" text,
	"body_text" text,
	"thumbnail_url" text,
	"is_active" boolean DEFAULT true,
	"published_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"template_id" uuid,
	"subject" text,
	"body_html" text,
	"body_text" text,
	"status" text DEFAULT 'draft',
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"recipient_count" integer DEFAULT 0,
	"recipient_filter" jsonb DEFAULT '{}'::jsonb,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_campaign_number_unique" UNIQUE("campaign_number")
);
--> statement-breakpoint
CREATE TABLE "claim_frc_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"frc_code" text,
	"description" text NOT NULL,
	"labor_hours" numeric(5, 2),
	"labor_rate" numeric(10, 2),
	"parts_amount" numeric(10, 2),
	"total_amount" numeric(10, 2),
	"status" text DEFAULT 'pending',
	"denial_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"manufacturer" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"manufacturer_claim_number" text,
	"preauth_number" text,
	"estimated_amount" numeric(10, 2),
	"approved_amount" numeric(10, 2),
	"dealer_notes" text,
	"operator_notes" text,
	"submitted_at" timestamp,
	"authorized_at" timestamp,
	"completed_at" timestamp,
	"paid_at" timestamp,
	"assigned_to_user_id" uuid,
	"assigned_at" timestamp,
	"review_started_at" timestamp,
	"awaiting_dealer_response" boolean DEFAULT false,
	"denial_reason" text,
	"denied_at" timestamp,
	"appeal_opened_at" timestamp,
	"stuck" boolean DEFAULT false,
	"stuck_since" timestamp,
	"submitted_to_mfr_at" timestamp,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
CREATE TABLE "client_parts_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"unit_id" uuid,
	"status" text DEFAULT 'cart',
	"line_items" jsonb DEFAULT '[]'::jsonb,
	"subtotal" numeric(10, 2),
	"taxes" numeric(10, 2),
	"shipping" numeric(10, 2),
	"total" numeric(10, 2),
	"stripe_payment_intent_id" text,
	"shipping_address" jsonb,
	"tracking_carrier" text,
	"tracking_number" text,
	"placed_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_parts_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "consignment_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agreement_number" text NOT NULL,
	"consignor_id" uuid NOT NULL,
	"dealership_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"split_pct" numeric(5, 2) NOT NULL,
	"duration_days" integer DEFAULT 90,
	"start_date" date,
	"end_date" date,
	"min_list_price" numeric(10, 2),
	"status" text DEFAULT 'pending_signature',
	"signed_at" timestamp,
	"signed_document_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consignment_agreements_agreement_number_unique" UNIQUE("agreement_number")
);
--> statement-breakpoint
CREATE TABLE "consignors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dealership_id" uuid NOT NULL,
	"contact_name" text NOT NULL,
	"contact_phone" text,
	"address_street" text,
	"address_city" text,
	"address_province" text,
	"address_postal_code" text,
	"stripe_connect_account_id" text,
	"stripe_connect_status" text,
	"tax_id_type" text,
	"tax_id_last4" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consignors_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_name" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"target_keyword" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"prompt_template" varchar(100) NOT NULL,
	"custom_context" text,
	"scheduled_generation" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"generated_post_id" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"activity_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_by" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_type" varchar(50),
	"file_size_bytes" integer,
	"uploaded_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_dealer_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_pipeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"stage" varchar(30) DEFAULT 'prospect' NOT NULL,
	"assigned_to" varchar(255),
	"next_follow_up" timestamp,
	"follow_up_note" text,
	"estimated_value" numeric(10, 2),
	"lost_reason" varchar(255),
	"lead_source" varchar(50) DEFAULT 'imported',
	"stage_changed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#4f8cff',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "crm_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "dealer_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"website" varchar(500),
	"address" varchar(500),
	"city" varchar(100),
	"state_province" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(2) DEFAULT 'CA' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"description" text,
	"brands_carried" text[],
	"services_offered" text[],
	"dealer_type" varchar(50) DEFAULT 'rv',
	"number_of_locations" integer DEFAULT 1,
	"estimated_unit_volume" varchar(50),
	"year_established" integer,
	"business_hours" jsonb,
	"logo_url" varchar(500),
	"cover_image_url" varchar(500),
	"gallery_images" text[],
	"listing_status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"claimed_by_user_id" integer,
	"listing_tier" varchar(20) DEFAULT 'basic' NOT NULL,
	"premium_expires_at" timestamp,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"page_views" integer DEFAULT 0 NOT NULL,
	"search_appearances" integer DEFAULT 0 NOT NULL,
	"contact_clicks" integer DEFAULT 0 NOT NULL,
	"website_clicks" integer DEFAULT 0 NOT NULL,
	"data_source" varchar(100),
	"external_id" varchar(255),
	"data_quality" varchar(20) DEFAULT 'imported',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dealer_listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dealer_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"sender_name" varchar(100) NOT NULL,
	"sender_email" varchar(255) NOT NULL,
	"sender_phone" varchar(30),
	"message_type" varchar(20) DEFAULT 'general' NOT NULL,
	"subject" varchar(255),
	"body" text NOT NULL,
	"interested_brand" varchar(100),
	"interested_model" varchar(200),
	"status" varchar(20) DEFAULT 'unread' NOT NULL,
	"dealer_reply" text,
	"dealer_replied_at" timestamp,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealer_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"reviewer_name" varchar(100) NOT NULL,
	"reviewer_email" varchar(255),
	"rating" integer NOT NULL,
	"title" varchar(200),
	"body" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"dealer_response" text,
	"dealer_responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"business_number" text,
	"street" text,
	"suite" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"country" text DEFAULT 'Canada',
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"contact_title" text,
	"plan" text DEFAULT 'plan_a',
	"monthly_fee" numeric(10, 2) DEFAULT '349.00',
	"billing_cycle" text DEFAULT 'monthly',
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"claim_fee_percent" numeric(5, 2),
	"claim_fee_min" numeric(10, 2),
	"claim_fee_max" numeric(10, 2),
	"daf_fee" numeric(10, 2),
	"pdi_fee" numeric(10, 2),
	"logo_url" text,
	"primary_color" text DEFAULT '#08235d',
	"accent_color" text DEFAULT '#22c55e',
	"custom_domain" text,
	"domain_verified" boolean DEFAULT false,
	"welcome_message" text,
	"manufacturers" jsonb DEFAULT '["Jayco"]'::jsonb,
	"status" text DEFAULT 'pending',
	"notes" text,
	"stripe_connect_account_id" text,
	"stripe_connect_status" text,
	"cloudflare_zone_id" text,
	"cloudflare_verification_token" text,
	"custom_domain_status" text,
	"techflow_enabled" boolean DEFAULT false,
	"marketing_enabled" boolean DEFAULT false,
	"consignment_enabled" boolean DEFAULT false,
	"parts_store_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid,
	"dealership_id" uuid,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"size_bytes" integer,
	"mime_type" text,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"transactional_id" uuid,
	"recipient_email" text NOT NULL,
	"event_type" text NOT NULL,
	"link_url" text,
	"user_agent" text,
	"ip_address" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"domain" text NOT NULL,
	"trigger_page" text,
	"actor_user_id" uuid,
	"actor_role" text,
	"dealership_id" uuid,
	"target_entity_type" text,
	"target_entity_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"state_changes" jsonb DEFAULT '[]'::jsonb,
	"priority" text DEFAULT 'informational',
	"fan_out_complete" boolean DEFAULT false,
	"fired_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requested_by" text,
	"dealership_id" uuid,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'under_review',
	"target_version" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fi_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"unit_id" uuid,
	"customer_name" text NOT NULL,
	"sale_price" numeric(10, 2),
	"financing" text,
	"products_offered" integer DEFAULT 0,
	"products_sold" integer DEFAULT 0,
	"revenue" numeric(10, 2),
	"dealer_notes" text,
	"status" text DEFAULT 'flagged',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fi_deals_deal_number_unique" UNIQUE("deal_number")
);
--> statement-breakpoint
CREATE TABLE "financing_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"unit_id" uuid,
	"submitted_by_user_id" uuid,
	"amount_requested" numeric(10, 2) NOT NULL,
	"down_payment" numeric(10, 2),
	"preferred_term_months" integer,
	"credit_info" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'draft',
	"accepted_lender_id" uuid,
	"accepted_terms" jsonb,
	"withdrawn_at" timestamp,
	"withdrawal_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financing_applications_application_number_unique" UNIQUE("application_number")
);
--> statement-breakpoint
CREATE TABLE "financing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"unit_id" uuid,
	"customer_name" text NOT NULL,
	"credit_score" integer,
	"amount_requested" numeric(10, 2),
	"down_payment" numeric(10, 2),
	"preferred_term" integer,
	"dealer_notes" text,
	"status" text DEFAULT 'submitted',
	"best_rate" numeric(5, 2),
	"best_lender" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financing_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"dealership_id" uuid,
	"unit_id" uuid,
	"invited_by" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1',
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"claim_id" uuid,
	"status" text DEFAULT 'draft',
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 4),
	"tax_amount" numeric(10, 2),
	"discount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'CAD',
	"payment_method" text,
	"payment_terms" text DEFAULT 'net_15',
	"notes" text,
	"recurring" text DEFAULT 'one_time',
	"due_date" date,
	"paid_at" timestamp,
	"stripe_payment_intent_id" text,
	"issued_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "landing_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content_html" text,
	"meta_description" text,
	"og_image_url" text,
	"template_id" uuid,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"views" integer DEFAULT 0,
	"submissions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_id" uuid NOT NULL,
	"source_page" text,
	"source_campaign_id" uuid,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'new',
	"assigned_to_user_id" uuid,
	"converted_to_customer_id" uuid,
	"last_contacted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lender_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lender_id" uuid NOT NULL,
	"connection_status" text DEFAULT 'pending',
	"last_health_check_at" timestamp,
	"health_status" text,
	"rate_sheet_last_pulled_at" timestamp,
	"rate_sheet_cache" jsonb DEFAULT '{}'::jsonb,
	"webhook_secret_ref" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lender_integrations_lender_id_unique" UNIQUE("lender_id")
);
--> statement-breakpoint
CREATE TABLE "lender_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"lender_id" uuid NOT NULL,
	"status" text DEFAULT 'draft',
	"submitted_at" timestamp,
	"responded_at" timestamp,
	"approved_rate" numeric(5, 3),
	"approved_term_months" integer,
	"approved_amount" numeric(10, 2),
	"approved_conditions" jsonb,
	"decline_reason" text,
	"counter_terms" jsonb,
	"lender_reference_id" text,
	"raw_response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"country" text DEFAULT 'Canada',
	"website" text,
	"contact_email" text,
	"contact_phone" text,
	"active" boolean DEFAULT true,
	"api_endpoint" text,
	"api_key_ref" text,
	"min_loan_amount" numeric(10, 2),
	"max_loan_amount" numeric(10, 2),
	"min_term_months" integer,
	"max_term_months" integer,
	"min_credit_score" integer,
	"approval_rules" jsonb DEFAULT '{}'::jsonb,
	"commission_structure" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"lender_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"principal_amount" numeric(10, 2) NOT NULL,
	"rate" numeric(5, 3) NOT NULL,
	"term_months" integer NOT NULL,
	"monthly_payment" numeric(10, 2),
	"status" text DEFAULT 'pending_funding',
	"funded_at" timestamp,
	"next_payment_date" date,
	"current_balance" numeric(10, 2),
	"days_late" integer DEFAULT 0,
	"commission_earned_by_ds360" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_waitlist" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"dealership_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"recipient_user_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending',
	"surface" text,
	"title" text,
	"body" text,
	"cta_label" text,
	"cta_route" text,
	"external_id" text,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"link_to" text,
	"is_read" boolean DEFAULT false,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"claim_id" uuid,
	"items" text NOT NULL,
	"estimated_cost" numeric(10, 2),
	"status" text DEFAULT 'requested',
	"eta" date,
	"priority" text DEFAULT 'normal',
	"operator_notes" text,
	"dealer_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parts_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "photo_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"claim_type" text NOT NULL,
	"claim_id" uuid,
	"dealer_notes" text,
	"photo_count" integer DEFAULT 0,
	"status" text DEFAULT 'uploaded',
	"uploaded_by" uuid NOT NULL,
	"processed_by" uuid,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "photo_batches_batch_number_unique" UNIQUE("batch_number")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid,
	"unit_id" uuid NOT NULL,
	"category" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"filename" text,
	"size_bytes" integer,
	"mime_type" text,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric(10, 2),
	"pricing_type" text DEFAULT 'fixed',
	"billing_frequency" text DEFAULT 'one_time',
	"tax_rate" text DEFAULT 'hst_13',
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quick_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealer_listing_id" integer NOT NULL,
	"dealer_message_id" integer,
	"customer_name" varchar(100) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(30),
	"request_type" varchar(30) NOT NULL,
	"brand" varchar(100),
	"model" varchar(200),
	"year_range" varchar(20),
	"budget_range" varchar(50),
	"additional_notes" text,
	"preferred_contact_method" varchar(20) DEFAULT 'email',
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"work_order_id" uuid,
	"status" text DEFAULT 'requested',
	"preferred_dates" jsonb DEFAULT '[]'::jsonb,
	"confirmed_date" timestamp,
	"issue_description" text,
	"location_address" text,
	"location_lat" numeric(10, 7),
	"location_lng" numeric(10, 7),
	"client_rating" integer,
	"client_review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_appointments_appointment_number_unique" UNIQUE("appointment_number")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dealership_id" uuid NOT NULL,
	"specializations" jsonb DEFAULT '[]'::jsonb,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"service_area_radius_km" integer DEFAULT 50,
	"base_location" jsonb,
	"hourly_rate" numeric(8, 2),
	"is_available" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technicians_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"is_auto_message" boolean DEFAULT false,
	"attachment_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"customer_id" uuid,
	"claim_id" uuid,
	"parts_order_id" uuid,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'open',
	"auto_created" boolean DEFAULT false,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_id" uuid NOT NULL,
	"vin" varchar(17) NOT NULL,
	"stock_number" text,
	"year" integer,
	"manufacturer" text,
	"model" text,
	"rv_type" text,
	"customer_id" uuid,
	"customer_name" text,
	"customer_email" text,
	"customer_phone" text,
	"customer_city" text,
	"display_photo_url" text,
	"delivery_date" date,
	"warranty_start" date,
	"warranty_end" date,
	"ext_warranty_provider" text,
	"ext_warranty_end" date,
	"ext_warranty_coverage" text,
	"daf_completed" boolean DEFAULT false,
	"daf_date" date,
	"pdi_completed" boolean DEFAULT false,
	"pdi_date" date,
	"status" text DEFAULT 'on_lot',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "units_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"sms_phone" text,
	"sms_verified" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"avatar_url" text,
	"role" text NOT NULL,
	"roles" jsonb DEFAULT '[]'::jsonb,
	"dealership_id" uuid,
	"timezone" text DEFAULT 'America/Toronto',
	"language" text DEFAULT 'en',
	"last_login_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warranty_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_number" text NOT NULL,
	"unit_id" uuid NOT NULL,
	"dealership_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"coverage" text,
	"start_date" date,
	"end_date" date,
	"sold_by_platform" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "warranty_plans_plan_number_unique" UNIQUE("plan_number")
);
--> statement-breakpoint
CREATE TABLE "work_order_labor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"tech_id" uuid NOT NULL,
	"description" text NOT NULL,
	"hours" numeric(5, 2) NOT NULL,
	"hourly_rate" numeric(8, 2),
	"synced_to_claim_id" uuid,
	"performed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_number" text NOT NULL,
	"dealership_id" uuid NOT NULL,
	"claim_id" uuid,
	"unit_id" uuid NOT NULL,
	"customer_id" uuid,
	"assigned_tech_id" uuid,
	"status" text DEFAULT 'unassigned',
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"arrived_at" timestamp,
	"completed_at" timestamp,
	"labor_estimate_hours" numeric(5, 2),
	"labor_actual_hours" numeric(5, 2),
	"parts_needed" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"tech_notes" text,
	"gps_track" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "work_orders_work_order_number_unique" UNIQUE("work_order_number")
);
--> statement-breakpoint
ALTER TABLE "content_queue" ADD CONSTRAINT "content_queue_generated_post_id_blog_posts_id_fk" FOREIGN KEY ("generated_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_attachments" ADD CONSTRAINT "crm_attachments_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_dealer_tags" ADD CONSTRAINT "crm_dealer_tags_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_dealer_tags" ADD CONSTRAINT "crm_dealer_tags_tag_id_crm_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."crm_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pipeline" ADD CONSTRAINT "crm_pipeline_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_messages" ADD CONSTRAINT "dealer_messages_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_reviews" ADD CONSTRAINT "dealer_reviews_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_dealer_listing_id_dealer_listings_id_fk" FOREIGN KEY ("dealer_listing_id") REFERENCES "public"."dealer_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_dealer_message_id_dealer_messages_id_fk" FOREIGN KEY ("dealer_message_id") REFERENCES "public"."dealer_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "camp_tpl_type_idx" ON "campaign_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "camp_tpl_active_idx" ON "campaign_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "campaigns_dealership_idx" ON "campaigns" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_scheduled_idx" ON "campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "frc_lines_claim_idx" ON "claim_frc_lines" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "claims_number_idx" ON "claims" USING btree ("claim_number");--> statement-breakpoint
CREATE INDEX "claims_dealership_idx" ON "claims" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "claims_unit_idx" ON "claims" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_parts_dealership_idx" ON "client_parts_orders" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "client_parts_customer_idx" ON "client_parts_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "client_parts_status_idx" ON "client_parts_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consignment_agree_consignor_idx" ON "consignment_agreements" USING btree ("consignor_id");--> statement-breakpoint
CREATE INDEX "consignment_agree_dealership_idx" ON "consignment_agreements" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "consignment_agree_unit_idx" ON "consignment_agreements" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "consignment_agree_status_idx" ON "consignment_agreements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consignors_user_idx" ON "consignors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consignors_dealership_idx" ON "consignors" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_listings_country" ON "dealer_listings" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_dealer_listings_province" ON "dealer_listings" USING btree ("state_province");--> statement-breakpoint
CREATE INDEX "idx_dealer_listings_city" ON "dealer_listings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_dealer_listings_slug" ON "dealer_listings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_dealer_listings_claimed" ON "dealer_listings" USING btree ("is_claimed");--> statement-breakpoint
CREATE INDEX "idx_dealer_listings_status" ON "dealer_listings" USING btree ("listing_status");--> statement-breakpoint
CREATE INDEX "email_events_campaign_idx" ON "email_events" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "email_events_recipient_idx" ON "email_events" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "email_events_type_idx" ON "email_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "email_events_occurred_idx" ON "email_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "events_event_id_idx" ON "events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_domain_idx" ON "events" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "events_actor_user_idx" ON "events" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "events_dealership_idx" ON "events" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "events_target_entity_idx" ON "events" USING btree ("target_entity_type","target_entity_id");--> statement-breakpoint
CREATE INDEX "events_fired_at_idx" ON "events" USING btree ("fired_at");--> statement-breakpoint
CREATE INDEX "fin_apps_dealership_idx" ON "financing_applications" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "fin_apps_customer_idx" ON "financing_applications" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "fin_apps_status_idx" ON "financing_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invoices_dealership_idx" ON "invoices" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "landing_pages_dealership_idx" ON "landing_pages" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "landing_pages_slug_idx" ON "landing_pages" USING btree ("dealership_id","slug");--> statement-breakpoint
CREATE INDEX "landing_pages_published_idx" ON "landing_pages" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "leads_dealership_idx" ON "leads" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_assigned_idx" ON "leads" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "lender_sub_app_idx" ON "lender_submissions" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "lender_sub_lender_idx" ON "lender_submissions" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "lender_sub_status_idx" ON "lender_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lenders_active_idx" ON "lenders" USING btree ("active");--> statement-breakpoint
CREATE INDEX "loan_deals_app_idx" ON "loan_deals" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "loan_deals_customer_idx" ON "loan_deals" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "loan_deals_status_idx" ON "loan_deals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notif_deliveries_event_idx" ON "notification_deliveries" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "notif_deliveries_recipient_idx" ON "notification_deliveries" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "notif_deliveries_status_idx" ON "notification_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notif_deliveries_unread_idx" ON "notification_deliveries" USING btree ("recipient_user_id","is_read");--> statement-breakpoint
CREATE INDEX "notif_deliveries_channel_idx" ON "notification_deliveries" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "batches_dealership_idx" ON "photo_batches" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "batches_status_idx" ON "photo_batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "photos_batch_idx" ON "photos" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "photos_unit_idx" ON "photos" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "svc_appt_dealership_idx" ON "service_appointments" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "svc_appt_customer_idx" ON "service_appointments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "svc_appt_unit_idx" ON "service_appointments" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "svc_appt_status_idx" ON "service_appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "technicians_user_idx" ON "technicians" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "technicians_dealership_idx" ON "technicians" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "technicians_available_idx" ON "technicians" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "tickets_dealership_idx" ON "tickets" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "units_vin_idx" ON "units" USING btree ("vin");--> statement-breakpoint
CREATE INDEX "units_dealership_idx" ON "units" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_dealership_idx" ON "users" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "wo_labor_wo_idx" ON "work_order_labor" USING btree ("work_order_id");--> statement-breakpoint
CREATE INDEX "wo_labor_tech_idx" ON "work_order_labor" USING btree ("tech_id");--> statement-breakpoint
CREATE INDEX "work_orders_dealership_idx" ON "work_orders" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "work_orders_tech_idx" ON "work_orders" USING btree ("assigned_tech_id");--> statement-breakpoint
CREATE INDEX "work_orders_claim_idx" ON "work_orders" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "work_orders_status_idx" ON "work_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "work_orders_scheduled_idx" ON "work_orders" USING btree ("scheduled_for");