class CreatePaymentReconciliations < ActiveRecord::Migration[7.0]
  def change
    create_table :payment_reconciliations do |t|
      t.references :payment_transaction, null: false, foreign_key: true
      t.decimal :amount_discrepancy, precision: 10, scale: 2, null: false
      t.text :discrepancy_description
      t.string :status, default: "pending"
      t.string :resolution_notes
      t.timestamps
    end

    add_index :payment_reconciliations, :status
    add_index :payment_reconciliations, :created_at
  end
end
