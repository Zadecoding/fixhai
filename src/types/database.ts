export type UserRole = "customer" | "technician" | "admin";
export type BookingStatus =
  | "pending"
  | "assigned"
  | "on_the_way"
  | "diagnosis_complete"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentType = "booking_fee" | "final_payment" | "refund";
export type DocumentStatus = "pending" | "approved" | "rejected";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      technician_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          category: string;
          city: string;
          pincode: string;
          service_pincodes: string[] | null; // array of pincodes the tech covers
          bio: string | null;
          verified: boolean;
          active: boolean;
          rating: number;
          earnings_total: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["technician_profiles"]["Row"],
          "created_at" | "rating" | "earnings_total"
        >;
        Update: Partial<
          Database["public"]["Tables"]["technician_profiles"]["Insert"]
        >;
      };
      technician_documents: {
        Row: {
          id: string;
          technician_id: string;
          document_type: string;
          document_url: string;
          status: DocumentStatus;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["technician_documents"]["Row"],
          "created_at" | "status"
        >;
        Update: Partial<
          Database["public"]["Tables"]["technician_documents"]["Insert"]
        >;
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          active: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["service_categories"]["Row"],
          "id"
        >;
        Update: Partial<
          Database["public"]["Tables"]["service_categories"]["Insert"]
        >;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          technician_id: string | null;
          category_id: string;
          issue_title: string;
          issue_description: string;
          address: string;
          city: string;
          pincode: string;
          preferred_time: string;
          booking_fee: number;
          final_quote: number | null;
          status: BookingStatus;
          payment_status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bookings"]["Row"],
          "created_at" | "updated_at" | "final_quote" | "technician_id"
        >;
        Update: Partial<
          Database["public"]["Tables"]["bookings"]["Insert"]
        >;
      };
      booking_updates: {
        Row: {
          id: string;
          booking_id: string;
          status: BookingStatus;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["booking_updates"]["Row"],
          "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["booking_updates"]["Insert"]
        >;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          amount: number;
          payment_type: PaymentType;
          status: PaymentStatus;
          provider: string | null;
          transaction_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["payments"]["Row"],
          "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["payments"]["Insert"]
        >;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          technician_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["reviews"]["Insert"]
        >;
      };
      support_tickets: {
        Row: {
          id: string;
          booking_id: string | null;
          user_id: string;
          subject: string;
          message: string;
          status: TicketStatus;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["support_tickets"]["Row"],
          "created_at" | "status"
        >;
        Update: Partial<
          Database["public"]["Tables"]["support_tickets"]["Insert"]
        >;
      };
    };
  };
}

// Convenient row types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type TechnicianProfile =
  Database["public"]["Tables"]["technician_profiles"]["Row"];
export type ServiceCategory =
  Database["public"]["Tables"]["service_categories"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingUpdate =
  Database["public"]["Tables"]["booking_updates"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type SupportTicket =
  Database["public"]["Tables"]["support_tickets"]["Row"];
