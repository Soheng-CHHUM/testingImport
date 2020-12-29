export const TYPES = {
    LISTEN_PARKING: 'listen_parking',
    LISTEN_ALERT_ZONE: 'listen_alert_zone',
    ALERT_PV: 'alert_pv',
    ALERT_ZONE: 'alert_zone',
}

export const isAlertPV = (type) => type == TYPES.ALERT_PV

export const isAlertZoneDanger = (type) => type == TYPES.ALERT_ZONE