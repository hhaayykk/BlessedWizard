# Lucky Wizard Bot - FIXED Referral System
# Install: pip install python-telegram-bot==20.7

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    filters,
    ContextTypes
)
import logging

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

BOT_TOKEN = "8417592854:AAHYll3iNtfdBjh9q3q5yiZ3o0OtsTh-tMQ"
WEBAPP_URL = "https://visionary-gingersnap-ab5c81.netlify.app/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    user_name = update.effective_user.first_name
    
    referrer_id = None
    if context.args and len(context.args) > 0:
        start_param = context.args[0]
        logger.info(f"🔮 User {user_id} ({user_name}) appeared through portal: {start_param}")
        
        if start_param.startswith('ref'):
            referrer_id = start_param[3:]
            logger.info(f"✨ Referral magic rune detected: {referrer_id}")
            
            if not referrer_id.isdigit():
                logger.warning(f"⚠️ Invalid rune pattern: {referrer_id}")
                referrer_id = None
            elif referrer_id == str(user_id):
                logger.warning(f"⚠️ Wizard tried to summon himself.")
                referrer_id = None
    
    webapp_url = WEBAPP_URL
    if referrer_id:
        webapp_url = f"{WEBAPP_URL}#tgWebAppStartParam=ref{referrer_id}"
        logger.info(f"🔗 Sending enchanted gateway: {webapp_url}")
    else:
        logger.info(f"🔗 Sending standard gateway: {webapp_url}")
    
    keyboard = [[
        InlineKeyboardButton(
            "🧙‍♂️ Enter the Wizard's Realm ✨", 
            web_app=WebAppInfo(url=webapp_url)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if referrer_id:
        message = (
            f"🧙‍♂️ *Welcome, {user_name}, Apprentice of Fortune!* \n\n"
            "🎁 *A Magical Referral Blessing Has Been Activated!*\n"
            "Both you and your summoner receive *+15 ⭐ Arcane Stars!*\n\n"
            "🔮 Tap below to claim destiny:"
        )
    else:
        message = (
            f"🧙‍♂️ *Welcome, {user_name}!* \n\n"
            "⭐ Earn enchanted Telegram Stars\n"
            "🔗 Invite friends to gain bonus rewards\n\n"
            "👇 Begin your magical adventure:"
        )
    
    await update.message.reply_text(
        message,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )
    
    logger.info(f"✅ Wizard greeting spell sent to {user_id}")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "📜 *Wizard's Codex of Fortune* ✨\n\n"
        "🎰 *How to Cast Spins:*\n"
        "• Open the realm\n"
        "• Offer Stars\n"
        "• Spin with stars\n\n"
        "🔗 *Referral Magic:*\n"
        "• Share your summoning link\n"
        "• Both gain *+15 Arcane Stars*\n\n"
        "👁‍🗨 Archmage Support: @BlessedWizardSupport"
    )
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.pre_checkout_query
    await query.answer(ok=True)
    logger.info(f"💰 Magical offering approved: {query.total_amount} Stars from {query.from_user.id}")

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    stars = payment.total_amount
    
    await update.message.reply_text(
        f"✨ *Transaction Complete!* ✨\n\n"
        f"⭐ *{stars} Stars* infused into your enchanted purse.\n\n"
        f"🧙‍♂️ Continue conjuring your destiny!",
        parse_mode='Markdown'
    )
    
    logger.info(f"💎 Offering accepted: {stars} Stars from {update.effective_user.id}")

def main():
    logger.info("=" * 60)
    logger.info("🧙‍♂️ LUCKY WIZARD BOT AWAKENING...")
    logger.info("=" * 60)
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    
    logger.info("✅ All wizard runes engraved.")
    logger.info(f"🔮 Portal to Realm: {WEBAPP_URL}")
    logger.info("🔗 Referral enchantments: ACTIVE")
    logger.info("=" * 60)
    
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()