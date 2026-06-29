import { useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../../store/hooks';
import { selectAllTasks } from '../../../store/slices/taskSlice';
import { useTheme } from '../../../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CHART_PADDING = 24;
const CHART_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2 - CHART_PADDING * 2;

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  accentBg: string;
  textPrimary: string;
  textSecondary: string;
  surfaceElevated: string;
  border: string;
}

function StatCard({
  label,
  value,
  icon,
  accent,
  accentBg,
  textPrimary,
  textSecondary,
  surfaceElevated,
  border,
}: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: surfaceElevated,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: accentBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: '800',
          color: textPrimary,
          lineHeight: 30,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: textSecondary,
          marginTop: 3,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <Text
      style={{
        fontSize: 17,
        fontWeight: '700',
        color,
        marginBottom: 12,
        marginTop: 4,
      }}
    >
      {title}
    </Text>
  );
}

// ── Legend Item ────────────────────────────────────────────────────────────────

function LegendItem({
  color,
  label,
  value,
  textPrimary,
  textSecondary,
}: {
  color: string;
  label: string;
  value: number;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 8,
        }}
      />
      <Text style={{ flex: 1, fontSize: 13, color: textSecondary, fontWeight: '500' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, color: textPrimary, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

// ── Chart Card ────────────────────────────────────────────────────────────────

function ChartCard({
  children,
  surface,
  border,
}: {
  children: React.ReactNode;
  surface: string;
  border: string;
}) {
  return (
    <View
      style={{
        backgroundColor: surface,
        borderRadius: 20,
        padding: CHART_PADDING,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  title,
  subtitle,
  textPrimary,
  textSecondary,
  accentBg,
  accent,
}: {
  title: string;
  subtitle: string;
  textPrimary: string;
  textSecondary: string;
  accentBg: string;
  accent: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          backgroundColor: accentBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Ionicons name="bar-chart-outline" size={36} color={accent} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: textPrimary,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: textSecondary,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation('profile');
  const tasks = useAppSelector(selectAllTasks);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'synced').length;
    const pending = tasks.filter((task) => task.status !== 'synced').length;
    const highPriority = tasks.filter((task) => task.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const nowSec = Date.now() / 1000;
    const monthAgoSec = nowSec - 30 * 24 * 3600;
    const thisMonthCompleted = tasks.filter(
      (task) => task.status === 'synced' && task.createdAt >= monthAgoSec,
    ).length;

    return { total, completed, pending, highPriority, completionRate, thisMonthCompleted };
  }, [tasks]);

  const donutData = useMemo(() => {
    if (stats.total === 0) {
      return [{ value: 1, color: isDark ? '#374151' : '#E5E7EB' }];
    }
    const result = [];
    if (stats.completed > 0) result.push({ value: stats.completed, color: '#22C55E' });
    if (stats.pending > 0) result.push({ value: stats.pending, color: '#F97316' });
    return result;
  }, [stats, isDark]);

  const progressRingData = useMemo(() => {
    const rate = stats.completionRate;
    return [
      { value: rate, color: colors.primary },
      { value: 100 - rate, color: isDark ? '#1F2937' : '#E5E7EB' },
    ];
  }, [stats.completionRate, colors.primary, isDark]);

  const weeklyBarData = useMemo(() => {
    const nowSec = Date.now() / 1000;
    return Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 6 - i;
      const dayEnd = nowSec - daysAgo * 24 * 3600;
      const dayStart = dayEnd - 24 * 3600;
      const date = new Date(dayStart * 1000);
      const dayLabel = date.toLocaleDateString('en', { weekday: 'short' });

      const count = tasks.filter(
        (task) =>
          task.status === 'synced' &&
          task.createdAt >= dayStart &&
          task.createdAt < dayEnd,
      ).length;

      return {
        value: count,
        label: dayLabel,
        frontColor: daysAgo === 0 ? colors.primary : isDark ? '#374151' : '#CBD5E1',
        topLabelComponent:
          count > 0
            ? () => (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 2,
                  }}
                >
                  {count}
                </Text>
              )
            : undefined,
      };
    });
  }, [tasks, colors, isDark]);

  const priorityData = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'high').length;
    const medium = tasks.filter((t) => t.priority === 'medium').length;
    const low = tasks.filter((t) => t.priority === 'low').length;
    const none = tasks.filter((t) => !t.priority).length;

    if (stats.total === 0) {
      return {
        pieData: [{ value: 1, color: isDark ? '#374151' : '#E5E7EB' }],
        counts: { high, medium, low, none },
      };
    }

    const pieData = [
      high > 0 && { value: high, color: '#EF4444' },
      medium > 0 && { value: medium, color: '#F97316' },
      low > 0 && { value: low, color: '#22C55E' },
      none > 0 && { value: none, color: '#9CA3AF' },
    ].filter(Boolean) as { value: number; color: string }[];

    return { pieData, counts: { high, medium, low, none } };
  }, [tasks, stats.total, isDark]);

  const barMax = useMemo(() => {
    const max = Math.max(...weeklyBarData.map((d) => d.value), 1);
    return Math.ceil(max / 2) * 2;
  }, [weeklyBarData]);

  // theme shortcuts
  const { textPrimary, textSecondary, surfaceElevated, primary, primaryLight, mapOverlayBorder } =
    colors;
  const surface = isDark ? colors.surface : '#FFFFFF';
  const pageBg = isDark ? colors.background : colors.surface;

  if (stats.total === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: pageBg }}>
        <EmptyState
          title={t('analytics.noData')}
          subtitle={t('analytics.noDataSub')}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accentBg={primaryLight}
          accent={primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: pageBg }}
      contentContainerStyle={{ padding: CARD_PADDING, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <StatCard
          label={t('analytics.totalTasks')}
          value={stats.total}
          icon="list-outline"
          accent={primary}
          accentBg={primaryLight}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          surfaceElevated={surfaceElevated}
          border={mapOverlayBorder}
        />
        <StatCard
          label={t('analytics.completed')}
          value={stats.completed}
          icon="checkmark-circle-outline"
          accent="#22C55E"
          accentBg={colors.successLight}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          surfaceElevated={surfaceElevated}
          border={mapOverlayBorder}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <StatCard
          label={t('analytics.pending')}
          value={stats.pending}
          icon="time-outline"
          accent={colors.warning}
          accentBg={colors.warningLight}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          surfaceElevated={surfaceElevated}
          border={mapOverlayBorder}
        />
        <StatCard
          label={t('analytics.highPriority')}
          value={stats.highPriority}
          icon="flag-outline"
          accent={colors.danger}
          accentBg={colors.dangerLight}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          surfaceElevated={surfaceElevated}
          border={mapOverlayBorder}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <StatCard
          label={t('analytics.completionRate')}
          value={`${stats.completionRate}%`}
          icon="trending-up-outline"
          accent={primary}
          accentBg={primaryLight}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          surfaceElevated={surfaceElevated}
          border={mapOverlayBorder}
        />
        <StatCard
          label={t('analytics.thisMonth')}
          value={stats.thisMonthCompleted}
          icon="calendar-outline"
          accent="#22C55E"
          accentBg={colors.successLight}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          surfaceElevated={surfaceElevated}
          border={mapOverlayBorder}
        />
      </View>

      {/* ── Completion Overview (Donut) ─────────────────────────────────────── */}
      <ChartCard surface={surface} border={mapOverlayBorder}>
        <SectionHeader title={t('analytics.completionOverview')} color={textPrimary} />
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <PieChart
            donut
            data={donutData}
            radius={90}
            innerRadius={66}
            isAnimated
            animationDuration={800}
            centerLabelComponent={() => (
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color: textPrimary,
                  }}
                >
                  {stats.completionRate}%
                </Text>
                <Text style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>
                  {t('analytics.completed').toLowerCase()}
                </Text>
              </View>
            )}
          />
        </View>
        <View>
          <LegendItem
            color="#22C55E"
            label={t('analytics.completed')}
            value={stats.completed}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
          />
          <LegendItem
            color="#F97316"
            label={t('analytics.pending')}
            value={stats.pending}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
          />
        </View>
      </ChartCard>

      {/* ── Progress Ring ──────────────────────────────────────────────────── */}
      <ChartCard surface={surface} border={mapOverlayBorder}>
        <SectionHeader title={t('analytics.completionRate')} color={textPrimary} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <PieChart
            donut
            data={progressRingData}
            radius={60}
            innerRadius={46}
            isAnimated
            animationDuration={900}
            strokeWidth={0}
            centerLabelComponent={() => (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: primary,
                }}
              >
                {stats.completionRate}%
              </Text>
            )}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '900',
                color: primary,
                lineHeight: 36,
              }}
            >
              {stats.completionRate}%
            </Text>
            <Text style={{ fontSize: 13, color: textSecondary, marginTop: 4, lineHeight: 18 }}>
              {stats.completed} / {stats.total} {t('analytics.tasks')}
            </Text>
            <View
              style={{
                height: 6,
                backgroundColor: isDark ? '#1F2937' : '#E5E7EB',
                borderRadius: 3,
                marginTop: 12,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${stats.completionRate}%`,
                  height: '100%',
                  backgroundColor: primary,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        </View>
      </ChartCard>

      {/* ── Weekly Activity (Bar Chart) ─────────────────────────────────────── */}
      <ChartCard surface={surface} border={mapOverlayBorder}>
        <SectionHeader title={t('analytics.weeklyActivity')} color={textPrimary} />
        <BarChart
          data={weeklyBarData}
          barWidth={Math.floor((CHART_WIDTH - 48) / 7) - 4}
          spacing={6}
          noOfSections={Math.min(barMax, 4)}
          maxValue={barMax}
          isAnimated
          animationDuration={700}
          yAxisTextStyle={{ color: textSecondary, fontSize: 11 }}
          xAxisLabelTextStyle={{ color: textSecondary, fontSize: 11 }}
          rulesColor={isDark ? '#1F2937' : '#F3F4F6'}
          yAxisColor="transparent"
          xAxisColor={isDark ? '#374151' : '#E5E7EB'}
          backgroundColor="transparent"
          hideRules={false}
          width={CHART_WIDTH}
          height={140}
          roundedTop
        />
      </ChartCard>

      {/* ── Priority Distribution (Pie Chart) ──────────────────────────────── */}
      <ChartCard surface={surface} border={mapOverlayBorder}>
        <SectionHeader title={t('analytics.priorityBreakdown')} color={textPrimary} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <PieChart
            data={priorityData.pieData}
            radius={70}
            isAnimated
            animationDuration={850}
            strokeWidth={2}
            strokeColor={surface}
          />
          <View style={{ flex: 1 }}>
            {priorityData.counts.high > 0 && (
              <LegendItem
                color="#EF4444"
                label={t('analytics.high')}
                value={priorityData.counts.high}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            )}
            {priorityData.counts.medium > 0 && (
              <LegendItem
                color="#F97316"
                label={t('analytics.medium')}
                value={priorityData.counts.medium}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            )}
            {priorityData.counts.low > 0 && (
              <LegendItem
                color="#22C55E"
                label={t('analytics.low')}
                value={priorityData.counts.low}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            )}
            {priorityData.counts.none > 0 && (
              <LegendItem
                color="#9CA3AF"
                label={t('analytics.none')}
                value={priorityData.counts.none}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            )}
          </View>
        </View>
      </ChartCard>
    </ScrollView>
  );
}
