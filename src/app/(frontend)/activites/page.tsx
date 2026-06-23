import { redirect } from 'next/navigation'

// Page /activites temporairement désactivée → redirection vers l'accueil.
export default function ActivitesPage() {
  redirect('/')
}
