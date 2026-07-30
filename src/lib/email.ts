import { Resend } from 'resend'

// Client instancié à la première utilisation, et non au chargement du module :
// `new Resend()` lève si la clé est absente, ce qui faisait échouer le build
// entier (Next évalue les modules importés en collectant les pages) au lieu du
// seul envoi d'e-mail.
let resendClient: Resend | null = null

function resend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY manquante : impossible d'envoyer l'e-mail.")
  }
  resendClient ??= new Resend(process.env.RESEND_API_KEY)
  return resendClient
}

const FROM_EMAIL = 'noreply@cercle-administrateurs.sn'
const GESTIONNAIRE_EMAIL = 'contact@cercle-administrateurs.sn'
const SITE_URL = 'https://cercle-administrateurs.sn'

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const { error } = await resend().emails.send({
    from:     `Cercle des Administrateurs Publics (CAP)<${FROM_EMAIL}>`,
    to,
    subject,
    html,
    replyTo,
  })
  if (error) throw new Error(error.message)
}

/**
 * @param mentionAutomatique  Affiche « ne pas répondre ». À laisser actif pour
 *   les envois depuis noreply@, à désactiver quand l'e-mail porte un `replyTo`
 *   exploitable — sans quoi la mention dit au destinataire de ne pas répondre
 *   alors qu'il le peut et le doit.
 */
function emailTemplate(title: string, contentHtml: string, mentionAutomatique = true): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background-color:#000000;padding:24px 32px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:bold;">Cercle des Administrateurs Publics</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.6;">
                    <h1 style="margin:0 0 16px;font-size:20px;color:#000000;">${title}</h1>
                    ${contentHtml}
                  </td>
                </tr>
                ${mentionAutomatique ? `
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
                    <p style="color:#888; font-size:12px; text-align:center; margin-top:20px;">
                      Ceci est un mail automatique, merci de ne pas y répondre.
                    </p>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

// ── Membre : email de bienvenue après inscription ──────────────────────────────

export async function sendWelcomeEmail(prenom: string, nom: string, email: string) {
  const html = emailTemplate('Bienvenue au CAP', `
    <p>Bonjour ${prenom} ${nom},</p>
    <p>
      Nous avons bien reçu votre demande d'adhésion au Cercle des Administrateurs Publics.
      Votre compte est en cours de validation par notre équipe.
    </p>
    <p>
      Vous recevrez un email dès que votre compte aura été activé. Vous aurez alors accès
      à l'ensemble des documents, ressources et activités réservés aux membres.
    </p>
    <p>
      <a href="${SITE_URL}" style="color:#000000;font-weight:bold;">Visiter le site du CAP</a>
    </p>
  `)
  return send(email, 'Inscription - Cercle des Administrateurs Publics', html)
}

// ── Gestionnaire : notification de nouvelle demande d'adhésion ─────────────────

export async function sendNewMemberNotification(
  prenom: string,
  nom: string,
  email: string,
  organisation?: string | null,
  fonction?: string | null,
) {
  console.log('[sendNewMemberNotification] Appelée pour', email, '— notification destinée à', GESTIONNAIRE_EMAIL)
  const html = emailTemplate('Nouvelle demande d\'adhésion', `
    <p>Une nouvelle demande d'adhésion vient d'être soumise sur le site du CAP :</p>
    <ul style="padding-left:20px;">
      <li><strong>Nom :</strong> ${prenom} ${nom}</li>
      <li><strong>Email :</strong> ${email}</li>
      ${fonction ? `<li><strong>Fonction :</strong> ${fonction}</li>` : ''}
      ${organisation ? `<li><strong>Organisation :</strong> ${organisation}</li>` : ''}
    </ul>
    <p>
      <a href="${SITE_URL}/gestionnaire/membres" style="color:#000000;font-weight:bold;">
        Examiner la demande
      </a>
    </p>
  `)
  return send(GESTIONNAIRE_EMAIL, 'Nouvelle demande d\'adhésion au CAP', html)
}

// ── Membre : email d'approbation ────────────────────────────────────────────────

export async function sendApprovalEmail(prenom: string, nom: string, email: string) {
  const html = emailTemplate('Félicitation', `
    <p>Bonjour ${prenom} ${nom},</p>
    <p>
      Bonne nouvelle ! Votre adhésion au Cercle des Administrateurs Publics a été
      approuvée par notre équipe.
    </p>
    <p>
      Vous avez désormais accès à votre espace membre, aux documents et aux activités
      réservés aux membres du CAP.
    </p>
    <p>
      <a href="${SITE_URL}/dashboard" style="color:#000000;font-weight:bold;">Accéder à mon espace membre</a>
    </p>
  `)
  return send(email, 'Inscription approuvée - Cercle des Administrateurs Publics', html)
}

// ── Membre : email de rejet ──────────────────────────────────────────────────────

export async function sendRejectionEmail(prenom: string, nom: string, email: string) {
  const html = emailTemplate('Votre demande d\'adhésion', `
    <p>Bonjour ${prenom} ${nom},</p>
    <p>
      Après examen, nous ne sommes malheureusement pas en mesure de valider votre
      demande d'adhésion au Cercle des Administrateurs Publics pour le moment.
    </p>
    <p>
      Pour toute question, n'hésitez pas à nous contacter à
      <a href="mailto:${GESTIONNAIRE_EMAIL}" style="color:#000000;font-weight:bold;">${GESTIONNAIRE_EMAIL}</a>.
    </p>
    <p>
      <a href="${SITE_URL}" style="color:#000000;font-weight:bold;">Visiter le site du CAP</a>
    </p>
  `)
  return send(email, 'Votre demande d\'adhésion au CAP', html)
}

// ── Gestionnaire : message du formulaire de contact ─────────────────────────────

export async function sendContactMessage(
  { nom, email, objet, message }: { nom: string; email: string; objet: string; message: string },
) {
  const html = emailTemplate('Nouveau message de contact', `
    <p>Un nouveau message a été envoyé depuis le formulaire de contact du site du CAP :</p>
    <ul style="padding-left:20px;">
      <li><strong>Nom :</strong> ${nom}</li>
      <li><strong>Email :</strong> ${email}</li>
      <li><strong>Objet :</strong> ${objet}</li>
    </ul>
    <p style="white-space:pre-wrap;">${message}</p>
  `, false)
  return send(GESTIONNAIRE_EMAIL, `Message de contact — ${objet}`, html, email)
}
