<?php

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Sale.php';
require_once __DIR__ . '/../models/Purchase.php';
require_once __DIR__ . '/../models/Paiement.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/Supplier.php';
require_once __DIR__ . '/../models/Shop.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/SaleLine.php';

require_once __DIR__ . '/../../vendor/autoload.php';

use Mpdf\Mpdf;

class PdfController extends Controller
{
    private function initMpdf(): Mpdf
    {
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 20,
            'margin_bottom' => 20,
        ]);

        $mpdf->SetTitle('Reçu');
        $mpdf->SetAuthor('NAFA');
        $mpdf->SetDisplayMode('fullpage');

        return $mpdf;
    }

    private function renderLogo(string $shopNom): string
    {
        $logoPath = __DIR__ . '/../../images/logo.png';
        $logoHtml = '';
        if (file_exists($logoPath)) {
            $type = mime_content_type($logoPath) ?: 'image/png';
            $data = base64_encode(file_get_contents($logoPath));
            $logoHtml = '<div style="text-align:center; margin-bottom:16px;">
                <img src="data:' . $type . ';base64,' . $data . '" style="height:36px; max-width:140px;" />
            </div>';
        }
        return $logoHtml . '<div style="text-align:center; margin-bottom:4px;">
            <h1 style="margin:0; font-size:20px; font-weight:700; color:#166534; letter-spacing:0.5px;">REÇU</h1>
            <p style="margin:4px 0 0; font-size:12px; color:#6B7280;">' . htmlspecialchars($shopNom) . '</p>
        </div>
        <div style="border-top:3px solid #16A34A; margin-bottom:18px;"></div>';
    }

    public function sale(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code vente requis');
        }

        $sale = Sale::findByCode($code);
        if (!$sale) {
            Response::error('Vente introuvable', [], 404);
        }

        $lines = SaleLine::findByVenteCode($code);
        $paiements = Paiement::getByReference('vente', $code);

        $clientNom = '';
        $clientTel = '';
        if (!empty($sale['client_code'])) {
            $client = Client::findByCode($sale['client_code']);
            if ($client) {
                $clientNom = $client['nom_client'] ?? '';
                $clientTel = $client['telephone_client'] ?? '';
            }
        }

        $shop = Shop::findByCode($sale['boutique_code']);
        $shopNom = $shop['libelle_boutique'] ?? 'Boutique';
        $shopDevise = $shop['devise_boutique'] ?? 'F';

        $lignesHtml = '';
        foreach ($lines as $line) {
            $produitLibelle = '';
            if (!empty($line['produit_code'])) {
                $product = Product::findByCode($line['produit_code']);
                if ($product) {
                    $produitLibelle = $product['libelle_produit'] ?? $line['produit_code'];
                }
            }
            $lignesHtml .= '<tr>
                <td style="text-align:left; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . htmlspecialchars($produitLibelle) . '</td>
                <td style="text-align:center; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . $this->formatNumber($line['quantite']) . '</td>
                <td style="text-align:right; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . $this->formatMoney($line['prix_unitaire'], $shopDevise) . '</td>
                <td style="text-align:right; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A; font-weight:600;">' . $this->formatMoney($line['montant'], $shopDevise) . '</td>
            </tr>';
        }

        $paiementsHtml = '';
        foreach ($paiements as $p) {
            $paiementsHtml .= '<tr>
                <td style="text-align:center; padding:8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . $this->formatFrenchDate($p['date_paiement']) . '</td>
                <td style="text-align:left; padding:8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . htmlspecialchars(ucfirst($p['mode_paiement'])) . '</td>
                <td style="text-align:right; padding:8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A; font-weight:600;">' . $this->formatMoney($p['montant_paiement'], $shopDevise) . '</td>
            </tr>';
        }

        $html = '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVuSans, Arial, sans-serif; font-size: 12px; color: #1A1A1A; background: #F8FAF9; }
        .card { background: #FFFFFF; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
        .info-section { margin-bottom: 12px; }
        .info-section table { width: 100%; border-collapse: collapse; }
        .info-section td { padding: 6px 0; vertical-align: top; }
        .info-section td:first-child { font-weight: 600; color: #6B7280; width: 35%; }
        table.data-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        table.data-table th { background-color: #16A34A; color: white; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 12px; }
        table.data-table td { padding: 10px 8px; border-bottom: 1px solid #E5E7EB; }
        .totals { margin-top: 12px; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 8px 6px; }
        .totals .total-row { font-weight: 600; background-color: #F8FAF9; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
        .badge-success { background-color: #DCFCE7; color: #166534; }
        .badge-warning { background-color: #FEF3C7; color: #92400E; }
        .badge-danger { background-color: #FEE2E2; color: #B91C1C; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 12px; }
        .section-title { font-size: 13px; font-weight: 600; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
    </style>
</head>
<body>
    <div class="card">
        ' . $this->renderLogo($shopNom) . '
        <div class="info-section">
            <table>
                <tr><td>Client:</td><td>' . htmlspecialchars($clientNom ?: 'Client occasionnel') . '</td></tr>
                <tr><td>Code vente:</td><td>' . htmlspecialchars($sale['code_vente']) . '</td></tr>
                <tr><td>Date:</td><td>' . $this->formatFrenchDate($sale['created_at_vente']) . '</td></tr>
                ' . ($clientTel ? '<tr><td>Téléphone:</td><td>' . htmlspecialchars($clientTel) . '</td></tr>' : '') . '
            </table>
        </div>
    </div>

    <div class="card">
        <div class="section-title">Lignes de vente</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width:45%;">Produit</th>
                    <th style="width:15%; text-align:center;">Qté</th>
                    <th style="width:20%; text-align:right;">Prix unit.</th>
                    <th style="width:20%; text-align:right;">Montant</th>
                </tr>
            </thead>
            <tbody>
                ' . $lignesHtml . '
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr class="total-row">
                    <td style="text-align:right;">Montant total:</td>
                    <td style="text-align:right; width:120px;">' . $this->formatMoney($sale['montant_vente'], $shopDevise) . '</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align:right;">Montant payé:</td>
                    <td style="text-align:right;">' . $this->formatMoney($sale['montant_paye_vente'], $shopDevise) . '</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align:right;">Reste à payer:</td>
                    <td style="text-align:right;">' . $this->formatMoney($sale['reste_a_payer_vente'], $shopDevise) . '</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align:right;">Statut:</td>
                    <td style="text-align:right;">' . $this->renderStatut($sale['statut_paiement_vente']) . '</td>
                </tr>
            </table>
        </div>
    </div>

    ' . ($paiementsHtml ? '
    <div class="card">
        <div class="section-title">Historique des paiements</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width:40%;">Date</th>
                    <th style="width:30%;">Mode</th>
                    <th style="width:30%; text-align:right;">Montant</th>
                </tr>
            </thead>
            <tbody>
                ' . $paiementsHtml . '
            </tbody>
        </table>
    </div>
    ' : '') . '

    <div class="footer">
        <p>Merci de votre confiance !</p>
        <p>Document généré le ' . date('d/m/Y à H:i') . '</p>
    </div>
</body>
</html>';

        $mpdf = $this->initMpdf();
        $mpdf->WriteHTML($html);
        $mpdf->Output('recu-vente-' . $sale['code_vente'] . '.pdf', 'D');
        exit;
    }

    public function purchase(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code achat requis');
        }

        $purchase = Purchase::findByCode($code);
        if (!$purchase) {
            Response::error('Achat introuvable', [], 404);
        }

        $paiements = Paiement::getByReference('achat', $code);

        $fournisseurNom = '';
        $fournisseurTel = '';
        if (!empty($purchase['fournisseur_code'])) {
            $fournisseur = Supplier::findByCode($purchase['fournisseur_code']);
            if ($fournisseur) {
                $fournisseurNom = $fournisseur['nom_fournisseur'] ?? '';
                $fournisseurTel = $fournisseur['telephone_fournisseur'] ?? '';
            }
        }

        $produitLibelle = '';
        if (!empty($purchase['produit_code'])) {
            $product = Product::findByCode($purchase['produit_code']);
            if ($product) {
                $produitLibelle = $product['libelle_produit'] ?? $purchase['produit_code'];
            }
        }

        $shop = Shop::findByCode($purchase['boutique_code']);
        $shopNom = $shop['libelle_boutique'] ?? 'Boutique';
        $shopDevise = $shop['devise_boutique'] ?? 'F';

        $paiementsHtml = '';
        foreach ($paiements as $p) {
            $paiementsHtml .= '<tr>
                <td style="text-align:center; padding:8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . $this->formatFrenchDate($p['date_paiement']) . '</td>
                <td style="text-align:left; padding:8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . htmlspecialchars(ucfirst($p['mode_paiement'])) . '</td>
                <td style="text-align:right; padding:8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A; font-weight:600;">' . $this->formatMoney($p['montant_paiement'], $shopDevise) . '</td>
            </tr>';
        }

        $html = '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVuSans, Arial, sans-serif; font-size: 12px; color: #1A1A1A; background: #F8FAF9; }
        .card { background: #FFFFFF; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
        .info-section { margin-bottom: 12px; }
        .info-section table { width: 100%; border-collapse: collapse; }
        .info-section td { padding: 6px 0; vertical-align: top; }
        .info-section td:first-child { font-weight: 600; color: #6B7280; width: 35%; }
        table.data-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        table.data-table th { background-color: #16A34A; color: white; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 12px; }
        table.data-table td { padding: 10px 8px; border-bottom: 1px solid #E5E7EB; }
        .totals { margin-top: 12px; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 8px 6px; }
        .totals .total-row { font-weight: 600; background-color: #F8FAF9; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
        .badge-success { background-color: #DCFCE7; color: #166534; }
        .badge-warning { background-color: #FEF3C7; color: #92400E; }
        .badge-danger { background-color: #FEE2E2; color: #B91C1C; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 12px; }
        .section-title { font-size: 13px; font-weight: 600; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
    </style>
</head>
<body>
    <div class="card">
        ' . $this->renderLogo($shopNom) . '
        <div class="info-section">
            <table>
                <tr><td>Fournisseur:</td><td>' . htmlspecialchars($fournisseurNom ?: '-') . '</td></tr>
                <tr><td>Code achat:</td><td>' . htmlspecialchars($purchase['code_achat']) . '</td></tr>
                <tr><td>Date:</td><td>' . $this->formatFrenchDate($purchase['date_achat']) . '</td></tr>
                ' . ($fournisseurTel ? '<tr><td>Téléphone:</td><td>' . htmlspecialchars($fournisseurTel) . '</td></tr>' : '') . '
            </table>
        </div>
    </div>

    <div class="card">
        <div class="section-title">Détail achat</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width:50%;">Produit</th>
                    <th style="width:15%; text-align:center;">Quantité</th>
                    <th style="width:17%; text-align:right;">Prix unit.</th>
                    <th style="width:18%; text-align:right;">Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align:left; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . htmlspecialchars($produitLibelle) . '</td>
                    <td style="text-align:center; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . $this->formatNumber($purchase['quantite_achat']) . '</td>
                    <td style="text-align:right; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A;">' . $this->formatMoney($purchase['prix_unitaire_achat'], $shopDevise) . '</td>
                    <td style="text-align:right; padding:10px 8px; border-bottom:1px solid #E5E7EB; color:#1A1A1A; font-weight:600;">' . $this->formatMoney($purchase['montant_achat'], $shopDevise) . '</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr class="total-row">
                    <td style="text-align:right;">Montant total:</td>
                    <td style="text-align:right; width:120px;">' . $this->formatMoney($purchase['montant_achat'], $shopDevise) . '</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align:right;">Montant payé:</td>
                    <td style="text-align:right;">' . $this->formatMoney($purchase['montant_paye_achat'], $shopDevise) . '</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align:right;">Reste à payer:</td>
                    <td style="text-align:right;">' . $this->formatMoney($purchase['reste_a_payer_achat'], $shopDevise) . '</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align:right;">Statut:</td>
                    <td style="text-align:right;">' . $this->renderStatut($purchase['statut_paiement_achat']) . '</td>
                </tr>
            </table>
        </div>
    </div>

    ' . ($paiementsHtml ? '
    <div class="card">
        <div class="section-title">Historique des paiements</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width:40%;">Date</th>
                    <th style="width:30%;">Mode</th>
                    <th style="width:30%; text-align:right;">Montant</th>
                </tr>
            </thead>
            <tbody>
                ' . $paiementsHtml . '
            </tbody>
        </table>
    </div>
    ' : '') . '

    <div class="footer">
        <p>Document généré le ' . date('d/m/Y à H:i') . '</p>
    </div>
</body>
</html>';

        $mpdf = $this->initMpdf();
        $mpdf->WriteHTML($html);
        $mpdf->Output('recu-achat-' . $purchase['code_achat'] . '.pdf', 'D');
        exit;
    }

    private function renderStatut(string $statut): string
    {
        $statut = strtolower($statut);
        if ($statut === 'paye' || $statut === 'payé') {
            return '<span class="badge badge-success">Payé</span>';
        }
        if ($statut === 'credit') {
            return '<span class="badge badge-warning">Crédit</span>';
        }
        return '<span class="badge badge-danger">' . htmlspecialchars(ucfirst($statut)) . '</span>';
    }

    private function formatMoney(float $amount, string $devise = 'F'): string
    {
        return number_format($amount, 0, ',', ' ') . ' ' . $devise;
    }

    private function formatNumber(float $number): string
    {
        return number_format($number, 0, ',', ' ');
    }

    private function formatFrenchDate(string $date): string
    {
        if (!$date) return '';
        $d = new DateTime($date);
        return $d->format('d/m/Y H:i');
    }
}
