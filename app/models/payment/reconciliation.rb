module Payment
  class Reconciliation < ApplicationRecord
    belongs_to :payment_transaction
    validates :amount_discrepancy, numericality: { greater_than: 0.01 }
    validates :status, inclusion: { in: %w[pending reviewed resolved] }

    scope :unresolved, -> { where(status: "pending") }
    scope :high_risk, -> { where("amount_discrepancy > ?", 100.00) }

    def self.generate_report(start_date, end_date)
      select("SUM(amount_discrepancy) as total_discrepancy, 
             COUNT(*) as total_issues,
             status")
        .where(created_at: start_date..end_date)
        .group(:status)
        .order(:status)
    end
  end
end
