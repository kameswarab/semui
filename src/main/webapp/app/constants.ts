export const ALERT_MSG_TIME_OUT = 20000;

export const SCENARIO_TYPE_INSTANTANEOUS = 1;
export const SCENARIO_TYPE_PROJECTION = 2;

export const SCENARIO_CLASSIFICATION_REGULATORY = 1;
export const SCENARIO_CLASSIFICATION_INTERNAL = 2;
export const SCENARIO_CLASSIFICATION_ADHOC = 3;

export const EXPANSION_CATEGORY_PREDETERMINED = 1;
export const EXPANSION_CATEGORY_MODEL_DRIVEN = 2;
export const EXPANSION_CATEGORY_BUSINESS_RULE = 3;

export const SCENARIO_DEFINED = 1;
export const SCENARIO_RISK_FACTOR_SELECTION = 2;
export const SCENARIO_SHOCKS = 3;
export const SCENARIO_OUTPUT = 4;
export const SCENARIO_REVIEW_INPROGRESS = 6;
export const SCENARIO_REJECTED = 8;
export const SCENARIO_APPROVED = 7;
export const MODEL_REVIEW_IN_PROGRESS = 24;
export const MODEL_REJECTED = 26;
export const MODEL_CONFIG = 22;
export const MODEL_APPROVED = 25;
export const SELECT_COM_MAXSIZE = 1000;

export const ANALYSIS_TYPE_SCENARIO = 'S';
export const ANALYSIS_TYPE_TIME_SERIES = 'T';

export const SCENARIO_TABS = [
    {
        id: 1,
        name: 'Scenario Info',
        value: 'scenario/createScenario',
        status: SCENARIO_DEFINED
    },
    {
        id: 2,
        name: 'Risk Factor Sets',
        value: 'scenario/selectRiskFactor',
        status: SCENARIO_RISK_FACTOR_SELECTION
    },
    {
        id: 3,
        name: 'Set Shocks',
        value: 'scenario/scenarioShocks',
        status: SCENARIO_SHOCKS
    },
    {
        id: 4,
        name: 'Review Output',
        value: 'scenario/scenarioOutput',
        status: SCENARIO_OUTPUT
    }
];

export const MODEL_LIBRARY_TABS = [
    {
        id: 1,
        name: 'Model Definition',
        value: 'model/modelDefinition',
        status: 21
    },
    {
        id: 2,
        name: 'Model Configuration',
        value: 'model/modelConfig',
        status: 22
    },
    /*  {
        id: 3,
        name: 'Dependent Risk Factors',
        value: 'model/selectDependentRiskFactors',
        status: 23
    },
    {
        id: 4,
        name: 'Independent Risk Factors',
        value: 'model/selectInDependentRiskFactors',
        status: 24
    },
    {
        id: 5,
        name: 'Data Preparation',
        value: 'model/dataPreparation',
        status: 25
    }, */

    {
        id: 3,
        name: 'Review Model',
        value: 'model/modelReview',
        status: 23
    }
];

export const ANALYSIS_TABS = [
    {
        name: 'Scenario',
        value: 'S'
    },
    {
        name: 'Time Series',
        value: 'T'
    }
];

export const MODEL_TABS = [
    {
        id: 1,
        name: 'Upload',
        value: 'Models/upload',
        status: 31
    },
    {
        id: 2,
        name: 'Edit',
        value: 'Models/editor',
        status: 32
    },
    {
        id: 3,
        name: 'Input Form',
        value: 'Models/input',
        status: 33
    },
    {
        id: 4,
        name: 'Test / Output',
        value: 'Models/testoutput',
        status: 34
    } /*,
    {
        id: 5,
        name: 'Output',
        value: 'Models/output',
        status: 35
    }*/
];

export const ANALYSIS_TYPE_COMPARISION = 1;
export const ANALYSIS_TYPE_PROPAGATION = 2;
export const ANALYSIS_TYPE_PREDICTION = 3;
export const ANALYSIS_TYPE_RATE_CURVE = 4;
export const ANALYSIS_TYPE_TIMESERIES = 5;
export const ANALYSIS_TYPE_HISTOGRAM = 6;
export const ANALYSIS_TYPE_ACF = 7;
export const ANALYSIS_TYPE_BOX = 8;
export const ANALYSIS_TYPE_RATE_CORRELATION = 9;

export const MODEL_LIB_RISK_FACTOR_TYPE_DEPENDENT = 'DEPENDENT';
export const MODEL_LIB_RISK_FACTOR_TYPE_INDEPENDENT = 'INDEPENDENT';

export const MODEL_METHODOLOGY_TYPE_CHALLENGER = 'CHALLENGER';
export const MODEL_METHODOLOGY_TYPE_CHAMPION = 'CHAMPION';

export const METHODOLOGY_INTERPOLATION = 13;
export const METHODOLOGY_PROXY = 14;
export const METHODOLOGY_USER_DEFINED = 15;
export const METHODOLOGY_QUANTILE = 16;

export const PROJECTION = 'Projection';
export const PROJECTION_ID = '2';

export const PREDETERMINED_LABEL = 'pre determined';
export const MODELDRIVEN_LABEL = 'model driven';
export const BUSINESSRULE_LABEL = 'business rule driven';
export const INTERPOLATION_LABEL = 'interpolation';
export const PROXY_LABEL = 'proxy';
export const USERDEFINED_LABEL = 'user defined';
export const QUANTILE_LABEL = 'quantile';
export const PCAGROUP_LABEL = 'pca group';
export const TRANSFORMATION_LOG = 1;
export const TRANSFORMATION_ABS = 2;
export const UNIT_PERCENTILE = '%';
export const UNIT_BPS = 'bps';

export const ASSUMPTION_TESTING = 'ASSUMPTION_TESTING';
export const ASSUMPTION_TESTING_TABLE = 'ASSUMPTION_TESTING_TABLE';
export const COEFFICIENT_STABILITY = 'COEFFICIENT_STABILITY';
export const PERFORMANCE_STABILITY_TRAINING = 'PERFORMANCE_STABILITY_TRAINING';
export const PERFORMANCE_STABILITY_TESTING = 'PERFORMANCE_STABILITY_TESTING';
export const IN_SAMPLE_FIT = 'IN_SAMPLE_FIT';
export const BACKTESTING_TRAINING = 'BACKTESTING_TRAINING';
export const BACKTESTING_TESTING = 'BACKTESTING_TESTING';

export const ASSUMPTION_TESTING_TABLE_TITLE = 'Assumption Testing Table';
export const ASSUMPTION_TESTING_TITLE = 'Assumption Testing';
export const COEFFICIENT_STABILITY_TITLE = 'Coefficient Stability';
export const PERFORMANCE_STABILITY_TRAINING_TITLE = 'Model Performance Stability in Training Data';
export const PERFORMANCE_STABILITY_TESTING_TITLE = 'Model Performance Stability in Testing Data';
export const IN_SAMPLE_FIT_TITLE = 'In-Sample Fit';
export const BACKTESTING_TRAINING_TITLE = 'Backtesting Training Fit';
export const BACKTESTING_TESTING_TITLE = 'Backtesting Testing Fit';
export const PERFORMANCE_STABILITY = 'Performance Stability';
export const PAGE_SIZE = 10;

export const MODEL_GRAPH_INDEX_VS_NAME_MAP = {
    2: ASSUMPTION_TESTING_TABLE,
    3: ASSUMPTION_TESTING,
    5: COEFFICIENT_STABILITY,
    6: PERFORMANCE_STABILITY_TRAINING,
    7: PERFORMANCE_STABILITY_TESTING,
    8: IN_SAMPLE_FIT,
    9: BACKTESTING_TRAINING,
    10: BACKTESTING_TESTING
};
export const MODEL_GRAPH_TITLE_MAP = {
    2: ASSUMPTION_TESTING_TABLE_TITLE,
    3: ASSUMPTION_TESTING_TITLE,
    5: COEFFICIENT_STABILITY_TITLE,
    6: PERFORMANCE_STABILITY_TRAINING_TITLE,
    7: PERFORMANCE_STABILITY_TESTING_TITLE,
    8: IN_SAMPLE_FIT_TITLE,
    9: BACKTESTING_TRAINING_TITLE,
    10: BACKTESTING_TESTING_TITLE
};
export const EXP_CATID_MODELDRIVEN = 2;
export const GLOBAL_EXP_MSG = 'Something went wrong due to network/conection issue, Please try after few seconds.';
export const MODEL_ERR_TEXT = 'unsatisfied,insignificance';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_FREQUENCY_VAL = '1';
export const TRANS_ERR_MSG =
    'Timeseries data for below riskfactors have negative values, hence log transformation cannot be applied. Please change the transformation type.';
export const DEFAULT_IP_LINEAR_ID = '1';
export const FREQ_ID_DAILY = 1;
export const FREQ_ID_WEEKLY = 2;
export const SHOCK_VALUE_DECIMAL = 8;
