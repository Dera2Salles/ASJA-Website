<?php

namespace App\Support;

/**
 * Habillage commun des courriers de l'établissement.
 *
 * Les messages sortaient sur treize couleurs — un bandeau noir, deux verts
 * différents, quatre gris de la palette Zinc — et chaque nouveau courrier en
 * inventait une de plus. Ils tiennent désormais sur **deux** : le vert de
 * l'ASJA et une encre. Tout le reste en est une nuance, et rien d'autre n'a le
 * droit d'entrer.
 *
 * Les styles sont rendus ici plutôt que recopiés dans chaque gabarit parce
 * qu'un client de messagerie ignore les feuilles de style : tout est en
 * attribut `style`, donc tout se duplique, donc tout diverge. Un titre de
 * section a une seule apparence parce qu'une seule fonction la produit.
 */
class MailTheme
{
    /* --- Les deux couleurs ---------------------------------------------- */

    /** Vert ASJA : bandeau, boutons, filets, accents. */
    public const BRAND = '#0a6b38';

    /** Encre : le texte, et lui seul. */
    public const INK = '#1b1f1d';

    /* --- Leurs nuances --------------------------------------------------- */

    /** Vert très clair : fonds de page, panneaux, pied de message. */
    public const BRAND_PALE = '#f1f7f3';

    /** Vert clair : filets et bordures. */
    public const BRAND_LINE = '#d3e3da';

    /** Encre atténuée, légèrement verte : mentions secondaires. */
    public const INK_SOFT = '#5c6560';

    public const PAPER = '#ffffff';

    /* --- Fragments de style ---------------------------------------------- */

    /** Corps du message : la seule pile de polices sûre en messagerie. */
    public static function body(): string
    {
        return 'margin:0;padding:0;background-color:' . self::BRAND_PALE
            . ';font-family:Helvetica,Arial,sans-serif;color:' . self::INK . ';';
    }

    /**
     * Petite capitale d'annonce. Sur le bandeau vert elle passe en clair —
     * c'est le seul endroit où l'encre céderait en lisibilité.
     */
    public static function eyebrow(bool $onBrand = false): string
    {
        return 'margin:0;font-size:11px;font-weight:bold;letter-spacing:1.6px;'
            . 'text-transform:uppercase;color:' . ($onBrand ? self::BRAND_PALE : self::INK_SOFT) . ';';
    }

    /** Titre de section, dans le fil du message. */
    public static function heading(): string
    {
        return 'margin:0 0 12px;font-size:13px;font-weight:bold;letter-spacing:1.2px;'
            . 'text-transform:uppercase;color:' . self::INK_SOFT . ';';
    }

    /** Paragraphe courant. */
    public static function text(string $margin = '0 0 20px'): string
    {
        return 'margin:' . $margin . ';font-size:15px;line-height:1.6;color:' . self::INK . ';';
    }

    /** Mention secondaire : une précision, jamais l'information principale. */
    public static function muted(string $margin = '0'): string
    {
        return 'margin:' . $margin . ';font-size:13px;line-height:1.6;color:' . self::INK_SOFT . ';';
    }

    /**
     * Panneau encadré.
     *
     * `$accent` remplace la bordure par un filet vert épais à gauche : c'est ce
     * qui distingue le message adressé au candidat du simple encadré
     * d'information, sans introduire de couleur supplémentaire.
     */
    public static function panel(bool $accent = false, string $margin = '0 0 24px'): string
    {
        return ($accent
            ? 'border-left:3px solid ' . self::BRAND . ';'
            : 'border:1px solid ' . self::BRAND_LINE . ';')
            . 'background-color:' . self::BRAND_PALE . ';margin:' . $margin . ';';
    }

    /** Cellule d'un tableau de données, filet du bas compris. */
    public static function cell(string $extra = ''): string
    {
        return 'padding:9px 0;border-bottom:1px solid ' . self::BRAND_LINE
            . ';font-size:14px;color:' . self::INK . ';' . $extra;
    }

    /**
     * Bouton d'action. Aplat vert, texte blanc : un lien souligné se perd dans
     * un message, et la couleur de lien par défaut varie d'un client à l'autre.
     */
    public static function button(): string
    {
        return 'display:inline-block;padding:13px 26px;background-color:' . self::BRAND
            . ';color:' . self::PAPER . ';font-size:15px;font-weight:bold;text-decoration:none;';
    }

    /** Le numéro de demande : la seule chose que le candidat doit retenir. */
    public static function figure(): string
    {
        return 'margin:6px 0 0;font-size:24px;font-weight:bold;letter-spacing:1px;color:' . self::BRAND . ';';
    }

    /** Liste à puces, au même corps que les paragraphes. */
    public static function list(string $margin = '0 0 24px'): string
    {
        return 'margin:' . $margin . ';padding-left:20px;font-size:14px;line-height:1.8;color:' . self::INK . ';';
    }
}
