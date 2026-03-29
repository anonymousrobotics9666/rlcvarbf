/**
 * RoboMME-style rollout browser for this project page.
 * Update the SUITES config below to swap GIFs, labels, or comparison groupings.
 */
(function () {
  var COMPARE_BASE = './static/videos/compare/';
  var SCENE_BASE = './static/videos/';
  var SINGLE_INTEGRATOR_ID_SEED106_BASE = './static/videos/single_integrator_obs_20/eval_seeds_100_1000_n901/seed_106/';
  /** Default ID reference for OOD placeholders that still point at a unicycle in-distribution seed. */
  var UNICYCLE_ID_SEED176_BASE = './static/videos/unicycle_obs_20/eval_seeds_100_1000_n901/seed_176/';
  /** First five eval seeds under unicycle_obs_20/eval_seeds_100_1000_n901 (Episode 1–5). */
  var UNICYCLE_ID_EPISODE_SEEDS = [176, 203, 315, 472, 634];
  /** Matches unicycle episode seed numbers; SI folders are populated (some may be placeholders). */
  var SINGLE_INTEGRATOR_ID_EPISODE_SEEDS = [106, 203, 315, 472, 504];
  var SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE = './static/videos/si_human_orca/single_integrator_obs_20/eval_seeds_100_1000_n901/seed_226/';
  var SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE = './static/videos/si_obs_30/single_integrator_obs_30/eval_seeds_100_1000_n901/seed_135/';
  var UNICYCLE_OOD_ORCA_SEED126_BASE = './static/videos/uni_human_orca/unicycle_obs_20/eval_seeds_100_1000_n901/seed_126/';
  var UNICYCLE_OOD_RADIUS_SEED168_BASE = './static/videos/uni_human_radius_0p5/unicycle_obs_20/eval_seeds_100_1000_n901/seed_168/';

  var METHOD_OPTIONS = [
    {
      value: 'rcbf',
      label: 'RCBF (collision cone)',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_rcbf_doubleint_v2_gamma0.1_betaNone_hcone.gif',
      note: 'Classical robust CBF baseline on the shared reference scene.'
    },
    {
      value: 'cbf',
      label: 'CBF (collision cone)',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_cbf_doubleint_v2_gamma0.1_betaNone_hcone.gif',
      note: 'Standard control barrier function baseline on the same setup.'
    },
    {
      value: 'cvar_lo',
      label: 'CVaR (distance) beta = 0.1',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_cvar_doubleint_v2_gamma0.1_beta0.01_hdist.gif',
      note: 'More conservative fixed-risk CVaR baseline.'
    },
    {
      value: 'cvar_hi',
      label: 'CVaR (distance) beta = 0.99',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_cvar_doubleint_v2_gamma0.1_beta0.99_hdist.gif',
      note: 'More aggressive fixed-risk CVaR baseline.'
    },
    {
      value: 'orca',
      label: 'ORCA+',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_orca_plus_doubleint_v2_gamma0.1_betaNone_hdist.gif',
      note: 'Reciprocal collision avoidance baseline.'
    },
    {
      value: 'crowdnav',
      label: 'CrowdNav (RL)',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_trajectory_animation.gif',
      note: 'Learned social-navigation policy without the proposed filter.'
    },
    {
      value: 'crowdnavpp',
      label: 'CrowdNav++ (RL)',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_trajectory_animation_crowd++.gif',
      note: 'Improved RL baseline on the same reference rollout.'
    },
    {
      value: 'proposed',
      label: 'Proposed',
      src: COMPARE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Risk-adaptive CVaR barrier function on the shared reference scene.'
    }
  ];

  var LEARNED_OPTIONS = [
    findMethod('orca'),
    findMethod('crowdnav'),
    findMethod('crowdnavpp'),
    findMethod('proposed')
  ];

  var ID_METHOD_DEFS = [
    { value: 'orca', label: 'ORCA', noteKey: 'orca' },
    { value: 'cbfqp', label: 'CBF-QP', noteKey: 'cbfqp' },
    { value: 'cvarqp', label: 'CVaR-BF-QP', noteKey: 'cvarqp' },
    { value: 'adapcvarqp', label: 'Adaptive-CVaR-BF', noteKey: 'adapcvarqp' },
    { value: 'rl', label: 'Vanilla RL', noteKey: 'rl' },
    { value: 'Crowdnav_const_vel', label: 'CrowdNav++ const vel', noteKey: 'crowdnav_cv' },
    { value: 'Crowdnav_inferred', label: 'CrowdNav++ inferred', noteKey: 'crowdnav_inf' },
    { value: 'rl_sf', label: 'Vanilla RL + Safety Filter', noteKey: 'rl_sf' },
    { value: 'Crowdnav_const_vel_sf', label: 'CrowdNav++ const vel + Safety Filter', noteKey: 'crowdnav_cv_sf' },
    { value: 'Crowdnav_inferred_sf', label: 'CrowdNav++ inferred + Safety Filter', noteKey: 'crowdnav_inf_sf' },
    { value: 'rlcbfgamma', label: 'BarrierNet', noteKey: 'barriernet' },
    { value: 'rlcvarbetaradius', label: 'Proposed', noteKey: 'proposed' }
  ];

  /**
   * In-distribution card notes (match pre-episode-refactor wording; only ORCA includes the robot phrase).
   */
  var ID_ROLLOUT_NOTES = {
    'single-integrator': {
      orca: '',
      cbfqp: '',
      cvarqp: '',
      adapcvarqp: '',
      rl: '',
      crowdnav_cv: '',
      crowdnav_inf: '',
      rl_sf: '',
      crowdnav_cv_sf: '',
      crowdnav_inf_sf: '',
      barriernet: '',
      proposed: ''
    },
    unicycle: {
      orca: '',
      cbfqp: '',
      cvarqp: '',
      adapcvarqp: '',
      rl: '',
      crowdnav_cv: '',
      crowdnav_inf: '',
      rl_sf: '',
      crowdnav_cv_sf: '',
      crowdnav_inf_sf: '',
      barriernet: '',
      proposed: ''
    }
  };

  function idEvalSeedBase(robotId, seed) {
    var folder = robotId === 'unicycle' ? 'unicycle_obs_20' : 'single_integrator_obs_20';
    return './static/videos/' + folder + '/eval_seeds_100_1000_n901/seed_' + seed + '/';
  }

  function idGifFilename(methodValue, seed, robotId) {
    if (methodValue === 'rlcvarbetaradius') {
      return 'rlcvarbetaradius_seed_' + seed + '_succ_1_coll_0.gif';
    }
    if (methodValue === 'rl_sf' && seed === 203 && robotId === 'unicycle') {
      return 'rl_sf_seed_203_succ_1_coll_0.gif';
    }
    return methodValue + '_seed_' + seed + '_succ_0_coll_1.gif';
  }

  function buildInDistributionIdOptions(robotId, seed) {
    var base = idEvalSeedBase(robotId, seed);
    var notesForRobot = ID_ROLLOUT_NOTES[robotId] || ID_ROLLOUT_NOTES.unicycle;
    return ID_METHOD_DEFS.map(function (def) {
      return {
        value: def.value,
        label: def.label,
        src: base + idGifFilename(def.value, seed, robotId),
        note: notesForRobot[def.noteKey] || ''
      };
    });
  }

  var OOD_METHOD_DEFS = [
    { value: 'orca', label: 'ORCA' },
    { value: 'cbfqp', label: 'CBF-QP' },
    { value: 'cvarqp', label: 'CVaR-BF-QP' },
    { value: 'adapcvarqp', label: 'Adaptive-CVaR-BF' },
    { value: 'rl', label: 'Vanilla RL' },
    { value: 'rl_sf', label: 'Vanilla RL + Safety Filter' },
    { value: 'rlcbfgamma', label: 'BarrierNet' },
    { value: 'rlcvarbetaradius', label: 'Proposed' }
  ];

  var OOD_CASE_CONFIG = {
    'single-integrator': {
      orca: {
        base: './static/videos/si_human_orca/single_integrator_obs_20/eval_seeds_100_1000_n901/',
        seeds: [226, 266, 313, 338, 358],
        note: ''
      },
      density: {
        base: './static/videos/si_obs_30/single_integrator_obs_30/eval_seeds_100_1000_n901/',
        seeds: [135, 147, 158, 170, 175],
        note: ''
      },
      radius: {
        base: './static/videos/si_human_radius_0p5/single_integrator_obs_20/eval_seeds_100_1000_n901/',
        seeds: [124, 130, 133, 136, 142],
        note: ''
      }
    },
    unicycle: {
      orca: {
        base: './static/videos/uni_human_orca/unicycle_obs_20/eval_seeds_100_1000_n901/',
        seeds: [126, 128, 143, 148, 168],
        note: ''
      },
      density: {
        base: './static/videos/uni_obs_30/unicycle_obs_30/eval_seeds_100_1000_n901/',
        seeds: [176, 186, 214, 233, 250],
        note: ''
      },
      radius: {
        base: './static/videos/uni_human_radius_0p5/unicycle_obs_20/eval_seeds_100_1000_n901/',
        seeds: [168, 245, 246, 276, 296],
        note: ''
      }
    }
  };

  function oodGifFilename(methodValue, seed) {
    if (methodValue === 'rlcvarbetaradius') {
      return 'rlcvarbetaradius_seed_' + seed + '_succ_1_coll_0.gif';
    }
    return methodValue + '_seed_' + seed + '_succ_0_coll_1.gif';
  }

  function buildOodOptions(robotId, caseKey, seed) {
    var caseConfig = OOD_CASE_CONFIG[robotId][caseKey];
    var base = caseConfig.base + 'seed_' + seed + '/';
    return OOD_METHOD_DEFS.map(function (def) {
      return {
        value: def.value,
        label: def.label,
        src: base + oodGifFilename(def.value, seed),
        note: caseConfig.note
      };
    });
  }

  function buildOodCases(robotId, caseKey, defaultA, defaultB) {
    var caseConfig = OOD_CASE_CONFIG[robotId][caseKey];
    return caseConfig.seeds.map(function (seed, index) {
      var options = buildOodOptions(robotId, caseKey, seed);
      return {
        label: 'Episode ' + (index + 1),
        goal: '',
        columns: [
          {
            kind: 'select',
            heading: 'Method A',
            options: options,
            defaultValue: defaultA
          },
          {
            kind: 'select',
            heading: 'Method B',
            options: options,
            defaultValue: defaultB
          }
        ]
      };
    });
  }

  var SINGLE_INTEGRATOR_OOD_PLACEHOLDER_OPTIONS = [
    {
      value: 'orca',
      label: 'ORCA',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'orca_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'cbfqp',
      label: 'CBF-QP',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'cbfqp_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'cvarqp',
      label: 'CVaR-BF-QP',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'cvarqp_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'adapcvarqp',
      label: 'Adaptive-CVaR-BF',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'adapcvarqp_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'rl',
      label: 'Vanilla RL',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'rl_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'rl_sf',
      label: 'Vanilla RL + Safety Filter',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'rl_sf_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'rlcbfgamma',
      label: 'BarrierNet',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'rlcbfgamma_seed_106_succ_0_coll_1.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    },
    {
      value: 'rlcvarbetaradius',
      label: 'Proposed',
      src: SINGLE_INTEGRATOR_ID_SEED106_BASE + 'rlcvarbetaradius_seed_106_succ_1_coll_0.gif',
      note: 'Current local single-integrator rollout used as a placeholder while dedicated OOD exports are not checked into this repo yet.'
    }
  ];

  var SINGLE_INTEGRATOR_OOD_ORCA_OPTIONS = [
    {
      value: 'orca',
      label: 'ORCA',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'orca_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'cbfqp',
      label: 'CBF-QP',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'cbfqp_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'cvarqp',
      label: 'CVaR-BF-QP',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'cvarqp_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'adapcvarqp',
      label: 'Adaptive-CVaR-BF',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'adapcvarqp_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rl',
      label: 'Vanilla RL',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'rl_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rl_sf',
      label: 'Vanilla RL + Safety Filter',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'rl_sf_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rlcbfgamma',
      label: 'BarrierNet',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'rlcbfgamma_seed_226_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rlcvarbetaradius',
      label: 'Proposed',
      src: SINGLE_INTEGRATOR_OOD_ORCA_SEED226_BASE + 'rlcvarbetaradius_seed_226_succ_1_coll_0.gif',
      note: 'Rollout from the single-integrator ORCA-obstacle-policy OOD export.'
    }
  ];

  var SINGLE_INTEGRATOR_OOD_DENSITY_OPTIONS = [
    {
      value: 'orca',
      label: 'ORCA',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'orca_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'cbfqp',
      label: 'CBF-QP',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'cbfqp_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'cvarqp',
      label: 'CVaR-BF-QP',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'cvarqp_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'adapcvarqp',
      label: 'Adaptive-CVaR-BF',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'adapcvarqp_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'rl',
      label: 'Vanilla RL',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'rl_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'rl_sf',
      label: 'Vanilla RL + Safety Filter',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'rl_sf_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'rlcbfgamma',
      label: 'BarrierNet',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'rlcbfgamma_seed_135_succ_0_coll_1.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    },
    {
      value: 'rlcvarbetaradius',
      label: 'Proposed',
      src: SINGLE_INTEGRATOR_OOD_DENSITY_SEED135_BASE + 'rlcvarbetaradius_seed_135_succ_1_coll_0.gif',
      note: 'Rollout from the single-integrator 30-obstacle OOD export.'
    }
  ];

  var UNICYCLE_OOD_ORCA_OPTIONS = [
    {
      value: 'orca',
      label: 'ORCA',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'orca_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'cbfqp',
      label: 'CBF-QP',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'cbfqp_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'cvarqp',
      label: 'CVaR-BF-QP',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'cvarqp_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'adapcvarqp',
      label: 'Adaptive-CVaR-BF',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'adapcvarqp_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rl',
      label: 'Vanilla RL',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'rl_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rl_sf',
      label: 'Vanilla RL + Safety Filter',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'rl_sf_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rlcbfgamma',
      label: 'BarrierNet',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'rlcbfgamma_seed_126_succ_0_coll_1.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    },
    {
      value: 'rlcvarbetaradius',
      label: 'Proposed',
      src: UNICYCLE_OOD_ORCA_SEED126_BASE + 'rlcvarbetaradius_seed_126_succ_1_coll_0.gif',
      note: 'Rollout from the ORCA-obstacle-policy OOD export.'
    }
  ];

  var UNICYCLE_OOD_DENSITY_OPTIONS = [
    {
      value: 'orca',
      label: 'ORCA',
      src: UNICYCLE_ID_SEED176_BASE + 'orca_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'cbfqp',
      label: 'CBF-QP',
      src: UNICYCLE_ID_SEED176_BASE + 'cbfqp_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'cvarqp',
      label: 'CVaR-BF-QP',
      src: UNICYCLE_ID_SEED176_BASE + 'cvarqp_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'adapcvarqp',
      label: 'Adaptive-CVaR-BF',
      src: UNICYCLE_ID_SEED176_BASE + 'adapcvarqp_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'rl',
      label: 'Vanilla RL',
      src: UNICYCLE_ID_SEED176_BASE + 'rl_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'rl_sf',
      label: 'Vanilla RL + Safety Filter',
      src: UNICYCLE_ID_SEED176_BASE + 'rl_sf_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'rlcbfgamma',
      label: 'BarrierNet',
      src: UNICYCLE_ID_SEED176_BASE + 'rlcbfgamma_seed_176_succ_0_coll_1.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    },
    {
      value: 'rlcvarbetaradius',
      label: 'Proposed',
      src: UNICYCLE_ID_SEED176_BASE + 'rlcvarbetaradius_seed_176_succ_1_coll_0.gif',
      note: 'Current local unicycle rollout used as the higher-density placeholder because a dedicated 30-obstacle export is not checked into this repo yet.'
    }
  ];

  var UNICYCLE_OOD_RADIUS_OPTIONS = [
    {
      value: 'orca',
      label: 'ORCA',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'orca_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'cbfqp',
      label: 'CBF-QP',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'cbfqp_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'cvarqp',
      label: 'CVaR-BF-QP',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'cvarqp_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'adapcvarqp',
      label: 'Adaptive-CVaR-BF',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'adapcvarqp_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'rl',
      label: 'Vanilla RL',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'rl_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'rl_sf',
      label: 'Vanilla RL + Safety Filter',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'rl_sf_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'rlcbfgamma',
      label: 'BarrierNet',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'rlcbfgamma_seed_168_succ_0_coll_1.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    },
    {
      value: 'rlcvarbetaradius',
      label: 'Proposed',
      src: UNICYCLE_OOD_RADIUS_SEED168_BASE + 'rlcvarbetaradius_seed_168_succ_1_coll_0.gif',
      note: 'Rollout from the increased-obstacle-radius OOD export.'
    }
  ];

  var PROPOSED_SCENES = {
    seed19: {
      label: '2 obstacles, sigma = 0.05',
      src: SCENE_BASE + 'seed19_noise0.05_obs2_umax0.9_besfm_umax0.9_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Sparse scene with moderate noise.'
    },
    seed20: {
      label: '4 obstacles, sigma = 0.05',
      src: SCENE_BASE + 'seed20_noise0.05_obs4_umax0.9_besfm_umax0.3_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Mid-density scene with moderate noise.'
    },
    seed4: {
      label: '5 obstacles, sigma = 0.05',
      src: SCENE_BASE + 'seed4_noise0.05_obs5_umax0.9_besfm_umax0.9_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Higher crowd density at the same noise level.'
    },
    seed18: {
      label: '6 obstacles, sigma = 0.00',
      src: SCENE_BASE + 'seed18_noise0.0_obs6_umax0.9_besfm_umax0.9_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Low-uncertainty rollout used for the noise sweep.'
    },
    seed100: {
      label: '6 obstacles, sigma = 0.025',
      src: SCENE_BASE + 'seed100_noise0.025_obs6_umax0.9_besfm_umax0.9_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Reference 6-obstacle scene with moderate noise.'
    },
    seed21: {
      label: '6 obstacles, sigma = 0.075',
      src: SCENE_BASE + 'seed21_noise0.075_obs6_umax0.9_besfm_umax0.9_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Same obstacle count with higher stochasticity.'
    },
    seed13: {
      label: '8 obstacles, sigma = 0.025',
      src: SCENE_BASE + 'seed13_noise0.025_obs8_umax0.9_besfm_umax0.3_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Dense reference rollout with moderate noise.'
    },
    seed14: {
      label: '8 obstacles, sigma = 0.05',
      src: SCENE_BASE + 'seed14_noise0.05_obs8_umax0.9_besfm_umax0.9_besfm_cvar_beta_dt_doubleint_v2_gamma0.1_betaNone_hdist_cone.gif',
      note: 'Same dense setup with higher noise.'
    }
  };

  function buildSuites(robotLabel, robotPhrase, robotId) {
    return [
      {
        id: 'case-orca-policy',
        label: 'Case I: ORCA-based obstacle policy',
        title: robotLabel + ' OOD generalization',
        cases: buildOodCases(robotId, 'orca', 'orca', 'rlcvarbetaradius')
      },
      {
        id: 'case-high-density',
        label: 'Case II: High obstacle density (30 obstacles)',
        title: robotLabel + ' OOD generalization',
        cases: buildOodCases(robotId, 'density', 'rl', 'rlcvarbetaradius')
      },
      {
        id: 'case-increased-radius',
        label: 'Case III: Increased obstacle radius (0.5 m)',
        title: robotLabel + ' OOD generalization',
        cases: buildOodCases(robotId, 'radius', 'cvarqp', 'rlcvarbetaradius')
      }
    ];
  }

  function buildIdSuites(robotLabel, robotPhrase, robotId) {
    var hasLocalSeedEpisode = robotId === 'single-integrator' || robotId === 'unicycle';
    if (!hasLocalSeedEpisode) {
      return [
        {
          id: 'id-reference',
          label: 'Reference scene',
          title: robotLabel + ' ID comparison',
          overview: 'In-distribution ' + robotPhrase + ', reference scene.',
          cases: [
            {
              label: 'Reference',
              goal: '',
              columns: [
                {
                  kind: 'select',
                  heading: 'Method A',
                  options: METHOD_OPTIONS,
                  defaultValue: 'rcbf'
                },
                {
                  kind: 'select',
                  heading: 'Method B',
                  options: METHOD_OPTIONS,
                  defaultValue: 'proposed'
                }
              ]
            }
          ]
        }
      ];
    }

    var seeds = robotId === 'unicycle' ? UNICYCLE_ID_EPISODE_SEEDS : SINGLE_INTEGRATOR_ID_EPISODE_SEEDS;
    var cases = seeds.map(function (seed, index) {
      var options = buildInDistributionIdOptions(robotId, seed);
      return {
        label: 'Episode ' + (index + 1),
        goal: '',
        columns: [
          {
            kind: 'select',
            heading: 'Method A',
            options: options,
            defaultValue: 'orca'
          },
          {
            kind: 'select',
            heading: 'Method B',
            options: options,
            defaultValue: 'rlcvarbetaradius'
          }
        ]
      };
    });

    return [
      {
        id: 'id-reference',
        label: 'In-distribution',
        title: robotLabel + ' ID comparison',
        cases: cases
      }
    ];
  }

  function findMethod(value) {
    for (var i = 0; i < METHOD_OPTIONS.length; i++) {
      if (METHOD_OPTIONS[i].value === value) {
        return METHOD_OPTIONS[i];
      }
    }
    return null;
  }

  function fixedColumn(heading, asset) {
    return {
      kind: 'fixed',
      heading: heading,
      asset: asset
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderApp(root, suites) {
    if (!root) return;

    var tabsMarkup = '';
    if (suites.length > 1) {
      tabsMarkup =
        '<div class="tabs-container sim-suite-tabs-wrap">' +
          '<div class="sim-suite-tabs" role="tablist">' +
            renderSuiteTabs(suites) +
          '</div>' +
        '</div>';
    }

    root.innerHTML =
      tabsMarkup +
      '<div class="sim-suite-panels">' +
        renderSuitePanels(suites) +
      '</div>';

    wireSuiteTabs(root, suites);
    wireAllPanels(root, suites);
  }

  function renderModeApp(root, modes, initialModeId) {
    if (!root) return;

    var activeModeId = initialModeId || (modes[0] && modes[0].id);

    root.innerHTML =
      '<div class="sim-mode-tabs-wrap">' +
        '<div class="sim-mode-tabs" role="tablist" aria-label="Robot mode">' +
          renderModeTabs(modes, activeModeId) +
        '</div>' +
      '</div>' +
      '<div class="sim-mode-active" data-mode-active-app></div>';

    var activeRoot = root.querySelector('[data-mode-active-app]');

    function applyMode(modeId) {
      var selectedMode = modes[0];
      for (var i = 0; i < modes.length; i++) {
        if (modes[i].id === modeId) {
          selectedMode = modes[i];
          break;
        }
      }

      activeModeId = selectedMode.id;
      root.querySelectorAll('.sim-mode-tab').forEach(function (item) {
        var isActive = item.getAttribute('data-mode-id') === activeModeId;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      renderApp(activeRoot, selectedMode.suites);
    }

    root.querySelectorAll('.sim-mode-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        applyMode(tab.getAttribute('data-mode-id'));
      });
    });

    applyMode(activeModeId);
  }

  function renderModeTabs(modes, activeModeId) {
    return modes.map(function (mode) {
      var isActive = mode.id === activeModeId;
      return '' +
        '<button type="button" class="sim-mode-tab' + (isActive ? ' active' : '') + '"' +
        ' data-mode-id="' + escapeHtml(mode.id) + '"' +
        ' role="tab" aria-selected="' + (isActive ? 'true' : 'false') + '">' +
          escapeHtml(mode.label) +
        '</button>';
    }).join('');
  }

  function wireStaticModePanels(root) {
    if (!root) return;

    var tabs = root.querySelectorAll('.sim-mode-tab');
    var panels = root.querySelectorAll('.sim-mode-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var modeId = tab.getAttribute('data-mode-id');
        tabs.forEach(function (item) {
          var isActive = item === tab;
          item.classList.toggle('active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-mode-panel') === modeId);
        });
      });
    });
  }

  function renderSuiteTabs(suites) {
    return suites.map(function (suite, index) {
      return '' +
        '<button type="button" class="sim-suite-tab' + (index === 0 ? ' active' : '') + '"' +
        ' data-suite-id="' + escapeHtml(suite.id) + '"' +
        ' role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '">' +
          escapeHtml(suite.label) +
        '</button>';
    }).join('');
  }

  function renderSuitePanels(suites) {
    return suites.map(function (suite, index) {
      return '' +
        '<div class="sim-suite-panel' + (index === 0 ? ' active' : '') + '" data-suite-panel="' + escapeHtml(suite.id) + '"></div>';
    }).join('');
  }

  function wireSuiteTabs(root, suites) {
    var tabs = root.querySelectorAll('.sim-suite-tab');
    var panels = root.querySelectorAll('.sim-suite-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var suiteId = tab.getAttribute('data-suite-id');
        tabs.forEach(function (item) {
          var isActive = item === tab;
          item.classList.toggle('active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-suite-panel') === suiteId);
        });
      });
    });
  }

  function wireAllPanels(root, suites) {
    suites.forEach(function (suite) {
      suite.activeCaseIndex = 0;
      var panel = root.querySelector('[data-suite-panel="' + suite.id + '"]');
      if (panel) {
        renderSuitePanel(panel, suite);
      }
    });
  }

  function renderSuitePanel(panel, suite) {
    var currentCase = suite.cases[suite.activeCaseIndex] || suite.cases[0];
    var overviewText = (suite.overview && String(suite.overview).trim()) || '';
    var overviewBlock = overviewText
      ? '<p class="sim-suite-overview">' + escapeHtml(overviewText) + '</p>'
      : '';
    var goalText = (currentCase.goal && String(currentCase.goal).trim()) || '';
    var goalBlock = goalText
      ? '<p class="demo-task-goal"><strong>Rollout setup:</strong> ' + escapeHtml(goalText) + '</p>'
      : '';
    panel.innerHTML =
      '<div class="sim-rollout-card">' +
        '<div class="sim-task-header">' +
          '<div class="sim-task-copy">' +
            '<span class="demo-task-name">' + escapeHtml(suite.title) + '</span>' +
            overviewBlock +
            goalBlock +
          '</div>' +
          renderCaseTabs(suite) +
        '</div>' +
        '<div class="sim-compare-row">' +
          renderColumns(currentCase.columns) +
        '</div>' +
      '</div>';

    wireCaseTabs(panel, suite);
    wireColumnSelects(panel, currentCase);
  }

  function renderCaseTabs(suite) {
    if (!suite.cases || suite.cases.length <= 1) {
      return '<div class="sim-episode-block sim-episode-block-static"><span class="sim-chip-label">Scene</span><span class="sim-static-pill">' + escapeHtml(suite.cases[0].label) + '</span></div>';
    }

    var buttons = suite.cases.map(function (entry, index) {
      return '' +
        '<button type="button" class="sim-episode-tab' + (index === suite.activeCaseIndex ? ' active' : '') + '"' +
        ' data-case-index="' + index + '">' +
          escapeHtml(entry.label) +
        '</button>';
    }).join('');

    return '' +
      '<div class="sim-episode-block">' +
        '<span class="sim-chip-label">Scenes</span>' +
        '<div class="sim-episode-tabs">' + buttons + '</div>' +
      '</div>';
  }

  function renderColumns(columns) {
    return columns.map(function (column, index) {
      if (column.kind === 'select') {
        return renderSelectColumn(column, index);
      }
      return renderFixedColumn(column);
    }).join('');
  }

  function renderSelectColumn(column, index) {
    var selected = getSelectedOption(column);
    var resultStatus = getResultStatus(selected);
    var selectOptions = column.options.map(function (option) {
      return '' +
        '<option value="' + escapeHtml(option.value) + '"' +
        (option.value === selected.value ? ' selected' : '') +
        '>' + escapeHtml(option.label) + '</option>';
    }).join('');

    return '' +
      '<article class="sim-compare-col" data-column-index="' + index + '">' +
        '<div class="sim-card-head">' +
          '<span class="sim-card-label">' + escapeHtml(column.heading) + '</span>' +
          '<select class="sim-select sim-model-select" aria-label="' + escapeHtml(column.heading) + '">' +
            selectOptions +
          '</select>' +
        '</div>' +
        '<img class="sim-demo-img" src="' + escapeHtml(selected.src) + '" alt="' + escapeHtml(selected.label) + '" loading="lazy">' +
        '<div class="result-label ' + escapeHtml(resultStatus.className) + '" data-result-badge>' + escapeHtml(resultStatus.label) + '</div>' +
      '</article>';
  }

  function renderFixedColumn(column) {
    return '' +
      '<article class="sim-compare-col sim-compare-col-fixed">' +
        '<div class="sim-card-head">' +
          '<span class="sim-card-label">' + escapeHtml(column.heading) + '</span>' +
          '<span class="sim-static-pill">' + escapeHtml(column.asset.label) + '</span>' +
        '</div>' +
        '<img class="sim-demo-img" src="' + escapeHtml(column.asset.src) + '" alt="' + escapeHtml(column.asset.label) + '" loading="lazy">' +
      '</article>';
  }

  function getSelectedOption(column) {
    var fallback = column.options[0];
    for (var i = 0; i < column.options.length; i++) {
      if (column.options[i].value === column.defaultValue) {
        return column.options[i];
      }
    }
    return fallback;
  }

  function getResultStatus(option) {
    var isSuccess = option && option.value === 'rlcvarbetaradius';
    return {
      label: isSuccess ? 'Success' : 'Collision',
      className: isSuccess ? 'success' : 'failure'
    };
  }

  function wireCaseTabs(panel, suite) {
    var buttons = panel.querySelectorAll('.sim-episode-tab');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        suite.activeCaseIndex = parseInt(button.getAttribute('data-case-index'), 10) || 0;
        renderSuitePanel(panel, suite);
      });
    });
  }

  function wireColumnSelects(panel, currentCase) {
    var columns = panel.querySelectorAll('[data-column-index]');
    columns.forEach(function (columnEl) {
      var columnIndex = parseInt(columnEl.getAttribute('data-column-index'), 10) || 0;
      var column = currentCase.columns[columnIndex];
      if (!column || column.kind !== 'select') return;

      var select = columnEl.querySelector('.sim-model-select');
      var image = columnEl.querySelector('.sim-demo-img');
      var badge = columnEl.querySelector('[data-result-badge]');
      var note = columnEl.querySelector('.sim-card-note');

      function applySelection(value) {
        var selected = column.options[0];
        for (var i = 0; i < column.options.length; i++) {
          if (column.options[i].value === value) {
            selected = column.options[i];
            break;
          }
        }
        column.defaultValue = selected.value;
        image.src = selected.src;
        image.alt = selected.label;
        if (badge) {
          var resultStatus = getResultStatus(selected);
          badge.textContent = resultStatus.label;
          badge.className = 'result-label ' + resultStatus.className;
        }
        note.textContent = selected.note || '';
      }

      select.addEventListener('change', function () {
        applySelection(select.value);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderApp(
      document.getElementById('simIdRolloutAppSingle'),
      buildIdSuites('Single Integrator', 'single-integrator robot', 'single-integrator')
    );
    renderApp(
      document.getElementById('simIdRolloutAppUnicycle'),
      buildIdSuites('Unicycle', 'unicycle robot', 'unicycle')
    );
    wireStaticModePanels(document.getElementById('simIdRolloutModeApp'));

    renderModeApp(
      document.getElementById('simRolloutModeApp'),
      [
        {
          id: 'single-integrator',
          label: 'Single Integrator',
          suites: buildSuites('Single Integrator', 'single-integrator robot', 'single-integrator')
        },
        {
          id: 'unicycle',
          label: 'Unicycle',
          suites: buildSuites('Unicycle', 'unicycle robot', 'unicycle')
        }
      ],
      'unicycle'
    );
  });
})();
