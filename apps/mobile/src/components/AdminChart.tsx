import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { theme } from '../theme';
import { GlassView } from './GlassView';

interface ChartDataPoint {
    value: number;
    label?: string;
    dataPointText?: string;
}

interface AdminChartProps {
    title: string;
    type: 'line' | 'bar';
    data: ChartDataPoint[];
    height?: number;
    color?: string;
}

export const AdminChart: React.FC<AdminChartProps> = ({
    title,
    type,
    data,
    height = 200,
    color = theme.colors.accent
}) => {
    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        color: color,
        thickness: 3,
        startFillColor: color,
        endFillColor: color,
        startOpacity: 0.4,
        endOpacity: 0.1,
        noOfSections: 4,
        maxValue: Math.max(...data.map(d => d.value)) * 1.2,
        yAxisTextStyle: { color: theme.colors.textSecondary, fontSize: 10 },
        xAxisLabelTextStyle: { color: theme.colors.textSecondary, fontSize: 10 },
        rulesColor: 'rgba(255,255,255,0.1)',
        yAxisColor: 'rgba(255,255,255,0.1)',
        xAxisColor: 'rgba(255,255,255,0.1)',
        dataPointsColor: color,
        textColor: theme.colors.textPrimary,
    };

    return (
        <GlassView style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.chartWrapper}>
                {type === 'line' ? (
                    <LineChart
                        data={data}
                        height={height}
                        width={screenWidth - 80} // Adjust for padding
                        initialSpacing={20}
                        curved
                        isAnimated
                        areaChart
                        {...chartConfig}
                    />
                ) : (
                    <BarChart
                        data={data}
                        height={height}
                        width={screenWidth - 80}
                        initialSpacing={20}
                        barWidth={30}
                        isAnimated
                        roundedTop
                        frontColor={color}
                        gradientColor={theme.colors.secondaryAccent}
                        {...chartConfig}
                    />
                )}
            </View>
        </GlassView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        padding: 16,
        borderRadius: 16
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 20,
        marginLeft: 10
    },
    chartWrapper: {
        alignItems: 'center',
        paddingRight: 20 // Space for last label
    }
});
