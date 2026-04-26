Stripe.api_key = Rails.application.credentials.stripe[:secret_key]
Stripe.webhook_signing_secret = Rails.application.credentials.stripe[:webhook_secret]

# Webhook endpoint for Stripe events
Rails.application.routes.draw do
  post '/stripe-webhook', to: proc { |req, res|
    payload = req.body.read
    sig_header = req.env['HTTP_STRIPE_SIGNATURE']
    
    begin
      event = Stripe::Webhook.construct_event(
        payload, 
        sig_header, 
        Stripe.webhook_signing_secret
      )
      
      case event.type
      when "checkout.session.completed"
        session = event.data.object
        User.find(session.client_reference_id).update(
          subscription_status: 'active',
          stripe_customer_id: session.customer
        )
      when "customer.subscription.deleted"
        User.find(event.data.object.customer).update(
          subscription_status: 'cancelled'
        )
      end
      
      res.status = 200
      res.body = "Received webhook"
    rescue Stripe::SignatureVerificationError
      res.status = 400
      res.body = "Invalid webhook signature"
    end
  }
end
