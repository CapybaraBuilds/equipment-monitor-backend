import Maintenance from '../models/pg/Maintenance';
import {getRecentAlerts} from './alertService';
import {Op} from 'sequelize';

// Analyze alerts of each equipment within one hour and generate a risk score
export interface RiskAssessment {
    equipmentId: string;
    riskScore: number; //0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    alertCount: number;
    recommandation: string;
}

export const assessEquipmentRisk = (): RiskAssessment[] => {
    const alerts = getRecentAlerts();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentAlerts = alerts.filter(alert => alert.timestamp > oneHourAgo);

    // Access alerts severity and count of each equipment
    const alertCounts = new Map<string, {warning: number; critical: number;}>();
    for(const alert of recentAlerts) {
        const current = alertCounts.get(alert.equipmentId) ?? {warning: 0, critical: 0};
        if(alert.severity === 'WARNING') current.warning += 1;
        else current.critical += 1
        alertCounts.set(alert.equipmentId, current);
    }

    const assessments:RiskAssessment[] = [];
    const RECOMMADATIONS: Record<RiskAssessment['recommandation'], string> = {
        LOW: 'Immediate maintenance required',
        MEDIUM: 'Schedule maintenance within 24 hours',
        HIGH: 'Monitor closely, schedule inspection this week',
        CRITICAL: 'Normal operation, follow routine schedule',
    }
    for (const [equipmentId, counts] of alertCounts){
        const score = Math.min(100, counts.warning * 10 + counts.critical * 25);
        const riskLevel: RiskAssessment['riskLevel'] = 
            score >= 75 ? 'CRITICAL' :
            score >= 50 ? 'HIGH' :
            score >= 25 ? 'MEDIUM': 'LOW';
        assessments.push({
            equipmentId,
            riskScore: score,
            riskLevel,
            alertCount: counts.warning + counts.critical,
            recommandation: RECOMMADATIONS[riskLevel]
        });
    }

    // rank in risk score in reversed order (highest score first)
    return assessments.sort((a,b)=>b.riskScore - a.riskScore);
}

// Find time window with no maintenance plan in the upcoming 7 days
export const suggestMaintenanceWindow = async (equipmentId: string): Promise<Date[] | null> => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const existing = await Maintenance.findAll({
        where: {
            status: 'PENDING',
            scheduledAt: {
                [Op.between]: [now, weekLater],
            },
        },
        attributes: ['scheduledAt'],
    })

    const busyDates = new Set(
        existing.map(date => new Date(date.scheduledAt).toDateString())
    );

    // Find time window
    const suggestions:Date[] = []
    for (let i = 1; i < 7; i++){
        const candidate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = candidate.getDay();
        // skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        // skip busydays
        if (busyDates.has(candidate.toDateString())) continue;

        suggestions.push(candidate)
    }
    return suggestions;
}