<?php

namespace App\Services;

use App\Models\User;
use App\Services\Analytics\BcpcNutritionAnalyticsService;
use App\Services\Analytics\DashboardOperationalService;
use App\Services\Analytics\DemographicsAnalyticsService;
use App\Services\Analytics\GadCommunityAnalyticsService;
use App\Services\Analytics\OrganizationMetricsService;
use App\Services\Analytics\VawcAnalyticsService;
use Illuminate\Support\Collection;

/**
 * Unified Analytics Orchestrator
 *
 * Coordinates modular domain-specific analytics services:
 * - DashboardOperationalService: Operational queues, activity logs, ribbon metrics
 * - VawcAnalyticsService: VAWC incidents, BPO metrics, longitudinal dossiers, threat patterns
 * - DemographicsAnalyticsService: Age demographics, Zone GIS distributions, hotspots
 * - BcpcNutritionAnalyticsService: WHO 3-Axis & e-OPT Plus nutritional screenings
 * - GadCommunityAnalyticsService: GAD pipeline, sector distribution, event tracking
 * - OrganizationMetricsService: Membership intakes, demographics, communications
 */
class AnalyticsService
{
    public function __construct(
        protected DashboardOperationalService $dashboardService,
        protected VawcAnalyticsService $vawcService,
        protected DemographicsAnalyticsService $demographicsService,
        protected BcpcNutritionAnalyticsService $bcpcService,
        protected GadCommunityAnalyticsService $gadService,
        protected OrganizationMetricsService $organizationService
    ) {}

    // ── Domain Service Accessors ──────────────────────────────────────────

    public function dashboard(): DashboardOperationalService
    {
        return $this->dashboardService;
    }

    public function vawc(): VawcAnalyticsService
    {
        return $this->vawcService;
    }

    public function demographics(): DemographicsAnalyticsService
    {
        return $this->demographicsService;
    }

    public function bcpc(): BcpcNutritionAnalyticsService
    {
        return $this->bcpcService;
    }

    public function gad(): GadCommunityAnalyticsService
    {
        return $this->gadService;
    }

    public function organizations(): OrganizationMetricsService
    {
        return $this->organizationService;
    }

    // ── Operational & Dashboard Methods ───────────────────────────────────

    public function getRibbonStats(int $year): array
    {
        return $this->dashboardService->getRibbonStats($year);
    }

    public function getSystemStats(?User $user = null): array
    {
        return $this->dashboardService->getSystemStats($user);
    }

    public function getActionQueue(?User $user = null): array
    {
        return $this->dashboardService->getActionQueue($user);
    }

    public function getOperationalActivity(int $limit = 5, ?User $user = null): array
    {
        return $this->dashboardService->getOperationalActivity($limit, $user);
    }

    public function getLatestAnnouncements(?User $user = null): array
    {
        return $this->dashboardService->getLatestAnnouncements($user);
    }

    public function getCommunitySnapshot(?User $user = null): ?array
    {
        return $this->dashboardService->getCommunitySnapshot($user);
    }

    // ── VAWC Methods ──────────────────────────────────────────────────────

    public function getCaseResolutionStats(int $year, ?User $user = null): array
    {
        return $this->vawcService->getCaseResolutionStats($year, $user);
    }

    public function getVawcSpecificStats(int $year): array
    {
        return $this->vawcService->getVawcSpecificStats($year);
    }

    public function getVawcChartConfig(): Collection
    {
        return $this->vawcService->getVawcChartConfig();
    }

    public function getMonthlyCaseAnalytics(string $type, int $year, Collection $abuseTypes): array
    {
        return $this->vawcService->getMonthlyCaseAnalytics($type, $year, $abuseTypes);
    }

    public function getVawcMonthlyTrend(int $year): array
    {
        return $this->vawcService->getVawcMonthlyTrend($year);
    }

    public function getVawcBpoTrends(int $year): array
    {
        return $this->vawcService->getVawcBpoTrends($year);
    }

    public function getVawcStatusBreakdown(int $year): array
    {
        return $this->vawcService->getVawcStatusBreakdown($year);
    }

    public function getRiskSeverityDistribution(int $year): array
    {
        return $this->vawcService->getRiskSeverityDistribution($year);
    }

    public function getThreatIndicatorPatterns(int $year): array
    {
        return $this->vawcService->getThreatIndicatorPatterns($year);
    }

    public function getVawcDossierAnalytics(int $year): array
    {
        return $this->vawcService->getVawcDossierAnalytics($year);
    }

    public function getVawcRelationshipAnalytics(int $year): array
    {
        return $this->vawcService->getVawcRelationshipAnalytics($year);
    }

    public function getVawcBpoOperationalMetrics(int $year): array
    {
        return $this->vawcService->getVawcBpoOperationalMetrics($year);
    }

    public function getInterventionGaps(int $year): array
    {
        return $this->vawcService->getInterventionGaps($year);
    }

    // ── Demographics & GIS Methods ────────────────────────────────────────

    public function getAgeDemographics(int $year): array
    {
        return $this->demographicsService->getAgeDemographics($year);
    }

    public function getZoneDistribution(int $year): array
    {
        return $this->demographicsService->getZoneDistribution($year);
    }

    public function getLocationDemographics(int $year, int $limit = 8): array
    {
        return $this->demographicsService->getLocationDemographics($year, $limit);
    }

    public function getZoneRiskImpact(int $year): array
    {
        return $this->demographicsService->getZoneRiskImpact($year);
    }

    // ── BCPC Nutrition Methods ────────────────────────────────────────────

    public function getBcpcNutritionSummary(): array
    {
        return $this->bcpcService->getBcpcNutritionSummary();
    }

    // ── GAD & Sector Methods ──────────────────────────────────────────────

    public function getGadAnalytics(int $year): array
    {
        return $this->gadService->getGadAnalytics($year);
    }

    public function getOrgSectorAnalysis(): array
    {
        return $this->gadService->getOrgSectorAnalysis();
    }

    // ── Organization & Membership Methods ─────────────────────────────────

    public function getMembershipTrends(int $year, ?User $user = null): array
    {
        return $this->organizationService->getMembershipTrends($year, $user);
    }

    public function getOrganizationAnalytics(int $year, ?int $orgId = null): array
    {
        return $this->organizationService->getOrganizationAnalytics($year, $orgId);
    }
}
