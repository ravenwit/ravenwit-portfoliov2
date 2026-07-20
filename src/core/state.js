export const STATE = {
    mouse: null,
    phase: 'LOADING',
    temperature: 150.0,
    loadProgress: 0,
    loadStage: 'INITIALIZING',
    scrollY: 0, targetScrollY: 0, velocity: 0,
    researchScrollY: 0, researchVelocity: 0,
    transitioning: false,
    coordinateTime: 0, properTime: 0,
    
    // Works section
    worksExhibitIndex: 0,
    
    // GeoFNO
    geofnoFrame: 0,
    geofnoPlaying: false,
    geofnoSpeed: 1,
    geofnoTotalFrames: 497,
    geofnoGtData: null,
    geofnoPredData: null,
    
    // Ising
    isingTemperature: 3.0,
    isingGrid: null,
    isingMagnetization: [],
};