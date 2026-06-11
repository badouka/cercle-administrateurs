import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const GESTIONNAIRE_EMAIL = 'alla.faye@digissol.com'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cap-senegal.org'

// Domaine d'expédition par défaut de Resend, fonctionne sans vérification de domaine
const FROM_EMAIL = 'Cercle des Administrateurs Publics <onboarding@resend.dev>'

function emailTemplate(title: string, contentHtml: string): string {
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
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
                    <a href="${SITE_URL}" style="color:#000000;font-size:13px;text-decoration:underline;">${SITE_URL}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

async function send(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
  if (error) throw new Error(error.message)
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
  return send(email, 'Bienvenue au Cercle des Administrateurs Publics', html)
}

// ── Gestionnaire : notification de nouvelle demande d'adhésion ─────────────────

export async function sendNewMemberNotification(
  prenom: string,
  nom: string,
  email: string,
  organisation?: string | null,
  fonction?: string | null,
) {
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
  const html = emailTemplate('Votre adhésion a été approuvée', `
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
  return send(email, 'Votre adhésion au CAP a été approuvée', html)
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
