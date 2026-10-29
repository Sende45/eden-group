// src/utils/detailsDevis.js
// Détails d'une demande de devis selon le pôle : mêmes champs et libellés que l'application mobile.

export const POLE_TERTIAIRE = 'Tertiaire & Bureaux';
export const POLE_PARTICULIER = 'Services Particuliers';

export const estTertiaire = (pole) => pole === POLE_TERTIAIRE;
export const estParticulier = (pole) => pole === POLE_PARTICULIER;

export const TYPES_LOGEMENT = [
  { id: 'APPARTEMENT', label: 'Appartement' },
  { id: 'MAISON', label: 'Maison' },
];

export const PRESTATIONS_PARTICULIER = [
  { id: 'MENAGE_COURANT', label: 'Ménage courant' },
  { id: 'GRAND_MENAGE', label: 'Grand ménage' },
  { id: 'VITRES', label: 'Vitres' },
  { id: 'REPASSAGE', label: 'Repassage' },
];

const LIBELLE_PRESTATION = Object.fromEntries(PRESTATIONS_PARTICULIER.map((p) => [p.id, p.label]));

const entier = (v) => {
  const n = Number(v);
  return v !== '' && v != null && Number.isInteger(n) && n >= 0 ? n : undefined;
};

/** Ne garde que les valeurs utiles, au bon format, selon le pôle (null pour Fin de chantier) */
export function nettoyerDetails(pole, d = {}) {
  if (estTertiaire(pole)) {
    return {
      nombrePieces: entier(d.nombrePieces),
      nombrePostes: entier(d.nombrePostes),
      nombreToilettes: entier(d.nombreToilettes),
      refectoire: typeof d.refectoire === 'boolean' ? d.refectoire : undefined,
    };
  }
  if (estParticulier(pole)) {
    return {
      typeLogement: d.typeLogement || undefined,
      nombrePieces: entier(d.nombrePieces),
      nombreSallesDeBain: entier(d.nombreSallesDeBain),
      nombreToilettes: entier(d.nombreToilettes),
      animaux: typeof d.animaux === 'boolean' ? d.animaux : undefined,
      prestation: d.prestation || undefined,
    };
  }
  return null;
}

/** Titre de la rubrique : "Les locaux" ou "Le logement" */
export const titreDetails = (pole) => (estTertiaire(pole) ? 'Les locaux' : 'Le logement');

/** Lignes [libellé, valeur] à afficher (admin, historique, PDF) */
export function lignesDetails(devis) {
  const x = devis?.details;
  if (!x) return [];
  const lignes = [];
  const nombre = (cle, libelle) => {
    if (typeof x[cle] === 'number') lignes.push([libelle, String(x[cle])]);
  };
  const ouiNon = (cle, libelle) => {
    if (typeof x[cle] === 'boolean') lignes.push([libelle, x[cle] ? 'Oui' : 'Non']);
  };

  if (estTertiaire(devis.pole)) {
    nombre('nombrePieces', 'Pièces / bureaux');
    nombre('nombrePostes', 'Postes de travail');
    nombre('nombreToilettes', 'Toilettes');
    ouiNon('refectoire', 'Réfectoire / espace de pause');
  } else if (estParticulier(devis.pole)) {
    if (x.typeLogement) lignes.push(['Logement', x.typeLogement === 'MAISON' ? 'Maison' : 'Appartement']);
    nombre('nombrePieces', 'Pièces');
    nombre('nombreSallesDeBain', 'Salles de bain');
    nombre('nombreToilettes', 'Toilettes');
    ouiNon('animaux', 'Animaux de compagnie');
    if (x.prestation) lignes.push(['Prestation souhaitée', LIBELLE_PRESTATION[x.prestation] ?? x.prestation]);
  }
  return lignes;
}