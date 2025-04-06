# Système de Réservation End-to-End

Ce document décrit l'implémentation du système de réservation end-to-end pour la plateforme Ollemi.

## Architecture

Le système de réservation est composé des éléments suivants :

1. **Interface utilisateur** : Un composant React moderne et professionnel inspiré par des sites comme Fresha et Planity
2. **API Routes** : Des endpoints Next.js pour gérer les réservations, les disponibilités et les rendez-vous
3. **Base de données** : Tables Supabase pour stocker les données de réservation et les horaires d'ouverture

## Composants Frontend

### EnhancedBookingFlow

Le composant principal de réservation qui guide l'utilisateur à travers le processus de réservation en 4 étapes :

1. Sélection du service
2. Sélection de la date
3. Sélection de l'heure
4. Informations client et confirmation

Ce composant est utilisé dans deux contextes :

- Sur la page de profil d'un professionnel (`/pro/[id]`)
- Sur la page dédiée de réservation (`/booking/[companyId]`)

### Tableaux de bord

Deux tableaux de bord ont été créés pour gérer les rendez-vous :

1. **Dashboard Pro** : Permet aux professionnels de voir et gérer leurs rendez-vous

   - Confirmer les rendez-vous
   - Annuler les rendez-vous
   - Marquer les rendez-vous comme terminés
   - Filtrer par statut et date

2. **Dashboard Client** : Permet aux clients de voir et gérer leurs rendez-vous
   - Voir les détails des rendez-vous
   - Annuler les rendez-vous
   - Filtrer par statut et date

## API Routes

### `/api/bookings`

- **GET** : Récupère les rendez-vous pour un client ou une entreprise
- **POST** : Crée un nouveau rendez-vous

### `/api/appointments/[id]`

- **GET** : Récupère les détails d'un rendez-vous spécifique
- **PATCH** : Met à jour le statut d'un rendez-vous (confirmer, annuler, terminer)
- **DELETE** : Supprime un rendez-vous (réservé aux propriétaires d'entreprise)

### `/api/companies/[id]/availability`

- **GET** : Récupère les créneaux horaires disponibles pour une entreprise à une date donnée
- **PUT** : Met à jour les horaires d'ouverture d'une entreprise

## Structure de la Base de Données

### Table `appointments`

Stocke les informations sur les rendez-vous :

- `id` : Identifiant unique
- `company_id` : ID de l'entreprise
- `service_id` : ID du service réservé
- `client_id` : ID du client (si connecté)
- `client_name` : Nom du client
- `client_email` : Email du client
- `client_phone` : Téléphone du client
- `start_time` : Date et heure de début
- `end_time` : Date et heure de fin
- `status` : Statut du rendez-vous (pending, confirmed, cancelled, completed)
- `notes` : Notes additionnelles

### Table `opening_hours`

Stocke les horaires d'ouverture des entreprises :

- `id` : Identifiant unique
- `company_id` : ID de l'entreprise
- `day_of_week` : Jour de la semaine (monday, tuesday, etc.)
- `open` : Indique si l'entreprise est ouverte ce jour
- `start_time` : Heure d'ouverture
- `end_time` : Heure de fermeture
- `break_start_time` : Début de la pause (optionnel)
- `break_end_time` : Fin de la pause (optionnel)

## Sécurité et Permissions

Le système utilise les politiques de sécurité au niveau des lignes (RLS) de Supabase pour garantir que :

1. Les professionnels ne peuvent voir et gérer que leurs propres rendez-vous
2. Les clients ne peuvent voir que leurs propres rendez-vous
3. Les clients ne peuvent annuler que leurs propres rendez-vous
4. Seuls les professionnels peuvent confirmer ou marquer les rendez-vous comme terminés

## Fonctionnalités Avancées

1. **Vérification de disponibilité** : Fonction SQL qui vérifie si un créneau horaire est disponible
2. **Gestion des pauses** : Support pour les pauses déjeuner dans les horaires d'ouverture
3. **Interface responsive** : Fonctionne sur mobile et desktop
4. **Confirmation par email** : Message de confirmation indiquant qu'un email a été envoyé

## Comment utiliser

### Pour les clients

1. Naviguez vers la page d'un professionnel (`/pro/[id]`)
2. Sélectionnez un service et cliquez sur "Réserver"
3. Suivez les étapes du processus de réservation
4. Consultez vos rendez-vous dans votre tableau de bord (`/dashboard/client/bookings`)

### Pour les professionnels

1. Gérez vos rendez-vous dans votre tableau de bord (`/dashboard/pro/bookings`)
2. Confirmez, annulez ou marquez les rendez-vous comme terminés
3. Consultez les statistiques de vos rendez-vous

## Améliorations futures

1. Intégration de paiement en ligne
2. Système de rappels par SMS
3. Possibilité de choisir un professionnel spécifique dans l'entreprise
4. Système d'avis après le rendez-vous
5. Gestion des abonnements et cartes cadeaux
