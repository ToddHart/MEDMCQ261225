/**
 * Lawn Maintenance Quote Calculator - Proof of Concept
 *
 * This demonstrates the core calculation logic for:
 * 1. Calculating lawn area (property - structures)
 * 2. Calculating perimeter for edging
 * 3. Generating quote
 *
 * Dependencies: turf.js (@turf/turf)
 * Install: npm install @turf/turf
 */

const turf = require('@turf/turf');

// =============================================================================
// SAMPLE DATA (would come from Regrid/Ecopia API in production)
// =============================================================================

// Property boundary (in real app, this comes from parcel API)
const propertyBoundary = turf.polygon([[
  [-93.2650, 44.9778],  // Northwest corner
  [-93.2648, 44.9778],  // Northeast corner
  [-93.2648, 44.9775],  // Southeast corner
  [-93.2650, 44.9775],  // Southwest corner
  [-93.2650, 44.9778]   // Close the polygon
]]);

// House footprint (from building footprint data)
const houseFootprint = turf.polygon([[
  [-93.26495, 44.97775],
  [-93.26485, 44.97775],
  [-93.26485, 44.97765],
  [-93.26495, 44.97765],
  [-93.26495, 44.97775]
]]);

// Driveway (could be from API or user-drawn)
const driveway = turf.polygon([[
  [-93.26498, 44.97778],
  [-93.26492, 44.97778],
  [-93.26492, 44.97768],
  [-93.26498, 44.97768],
  [-93.26498, 44.97778]
]]);

// Additional structures (garage, shed, patio, etc.)
const garage = turf.polygon([[
  [-93.26482, 44.97772],
  [-93.26478, 44.97772],
  [-93.26478, 44.97768],
  [-93.26482, 44.97768],
  [-93.26482, 44.97772]
]]);

// =============================================================================
// CONFIGURATION
// =============================================================================

const PRICING_CONFIG = {
  pricePerSqFt: 0.015,        // $0.015 per square foot for mowing
  edgingPricePerLinearFt: 0.25, // $0.25 per linear foot for edging
  baseServiceFee: 25.00,      // Minimum service charge
  includeEdging: true,        // User selectable
  complexityMultiplier: 1.0   // For slopes, obstacles (future feature)
};

// =============================================================================
// CORE CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate lawn area by subtracting all structures from property
 */
function calculateLawnArea(propertyPoly, structures) {
  try {
    let lawnArea = propertyPoly;

    // Subtract each structure from the property
    for (const structure of structures) {
      const difference = turf.difference(
        turf.featureCollection([lawnArea, structure])
      );

      if (difference) {
        lawnArea = difference;
      }
    }

    // Calculate area in square meters
    const areaM2 = turf.area(lawnArea);

    // Convert to square feet (1 m² = 10.764 ft²)
    const areaSqFt = areaM2 * 10.764;

    return {
      areaSquareMeters: Math.round(areaM2),
      areaSquareFeet: Math.round(areaSqFt),
      geometry: lawnArea
    };
  } catch (error) {
    throw new Error(`Lawn area calculation failed: ${error.message}`);
  }
}

/**
 * Calculate perimeter of lawn for edging quotes
 */
function calculateLawnPerimeter(lawnGeometry) {
  try {
    // Calculate perimeter in meters
    const perimeterM = turf.length(turf.polygonToLine(lawnGeometry), { units: 'meters' });

    // Convert to feet (1 m = 3.28084 ft)
    const perimeterFt = perimeterM * 3.28084;

    return {
      perimeterMeters: Math.round(perimeterM),
      perimeterFeet: Math.round(perimeterFt)
    };
  } catch (error) {
    throw new Error(`Perimeter calculation failed: ${error.message}`);
  }
}

/**
 * Calculate individual structure perimeters (for detailed breakdown)
 */
function calculateStructurePerimeters(structures) {
  return structures.map((structure, index) => {
    const perimeterM = turf.length(turf.polygonToLine(structure), { units: 'meters' });
    const perimeterFt = perimeterM * 3.28084;

    return {
      structureId: index,
      perimeterMeters: Math.round(perimeterM),
      perimeterFeet: Math.round(perimeterFt)
    };
  });
}

/**
 * Generate quote based on lawn area and perimeter
 */
function generateQuote(lawnData, perimeterData, config) {
  // Calculate mowing cost
  const mowingCost = lawnData.areaSquareFeet * config.pricePerSqFt;

  // Calculate edging cost (if requested)
  const edgingCost = config.includeEdging
    ? perimeterData.perimeterFeet * config.edgingPricePerLinearFt
    : 0;

  // Apply complexity multiplier
  const subtotal = (mowingCost + edgingCost) * config.complexityMultiplier;

  // Apply base service fee or calculated cost, whichever is higher
  const total = Math.max(subtotal, config.baseServiceFee);

  return {
    measurements: {
      lawnAreaSqFt: lawnData.areaSquareFeet,
      lawnAreaSqM: lawnData.areaSquareMeters,
      perimeterFt: perimeterData.perimeterFeet,
      perimeterM: perimeterData.perimeterMeters
    },
    breakdown: {
      mowingCost: parseFloat(mowingCost.toFixed(2)),
      edgingCost: parseFloat(edgingCost.toFixed(2)),
      complexityMultiplier: config.complexityMultiplier,
      subtotal: parseFloat(subtotal.toFixed(2)),
      baseServiceFee: config.baseServiceFee
    },
    total: parseFloat(total.toFixed(2)),
    configuration: {
      pricePerSqFt: config.pricePerSqFt,
      edgingPricePerLinearFt: config.edgingPricePerLinearFt,
      includeEdging: config.includeEdging
    }
  };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

function calculateLawnMaintenanceQuote() {
  console.log('🌱 Lawn Maintenance Quote Calculator - POC\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Collect all structures to subtract
    const structures = [houseFootprint, driveway, garage];

    console.log('\n📍 PROPERTY DATA:');
    console.log(`  • Property boundary: Defined`);
    console.log(`  • Structures to subtract: ${structures.length}`);
    console.log(`    - House footprint`);
    console.log(`    - Driveway`);
    console.log(`    - Garage`);

    // Step 2: Calculate lawn area
    console.log('\n📐 CALCULATING LAWN AREA...');
    const lawnArea = calculateLawnArea(propertyBoundary, structures);
    console.log(`  ✓ Lawn area: ${lawnArea.areaSquareFeet.toLocaleString()} sq ft`);
    console.log(`  ✓ Lawn area: ${lawnArea.areaSquareMeters.toLocaleString()} sq m`);

    // Step 3: Calculate perimeter (for edging)
    console.log('\n📏 CALCULATING PERIMETER...');
    const perimeter = calculateLawnPerimeter(lawnArea.geometry);
    console.log(`  ✓ Perimeter: ${perimeter.perimeterFeet.toLocaleString()} ft`);
    console.log(`  ✓ Perimeter: ${perimeter.perimeterMeters.toLocaleString()} m`);

    // Step 4: Calculate structure perimeters (optional detail)
    const structurePerimeters = calculateStructurePerimeters(structures);
    console.log('\n🏗️  STRUCTURE PERIMETERS:');
    structurePerimeters.forEach((sp, idx) => {
      const names = ['House', 'Driveway', 'Garage'];
      console.log(`  • ${names[idx]}: ${sp.perimeterFeet} ft`);
    });

    // Step 5: Generate quote
    console.log('\n💰 GENERATING QUOTE...');
    const quote = generateQuote(lawnArea, perimeter, PRICING_CONFIG);

    console.log('\n' + '='.repeat(60));
    console.log('📋 QUOTE SUMMARY');
    console.log('='.repeat(60));

    console.log('\nMEASUREMENTS:');
    console.log(`  • Lawn area: ${quote.measurements.lawnAreaSqFt.toLocaleString()} sq ft`);
    console.log(`  • Perimeter: ${quote.measurements.perimeterFt.toLocaleString()} ft`);

    console.log('\nPRICING BREAKDOWN:');
    console.log(`  • Mowing (${quote.measurements.lawnAreaSqFt.toLocaleString()} sq ft × $${PRICING_CONFIG.pricePerSqFt}): $${quote.breakdown.mowingCost.toFixed(2)}`);

    if (PRICING_CONFIG.includeEdging) {
      console.log(`  • Edging (${quote.measurements.perimeterFt.toLocaleString()} ft × $${PRICING_CONFIG.edgingPricePerLinearFt}): $${quote.breakdown.edgingCost.toFixed(2)}`);
    }

    if (quote.breakdown.complexityMultiplier !== 1.0) {
      console.log(`  • Complexity multiplier: ${quote.breakdown.complexityMultiplier}x`);
    }

    console.log(`  • Subtotal: $${quote.breakdown.subtotal.toFixed(2)}`);
    console.log(`  • Base service fee: $${quote.breakdown.baseServiceFee.toFixed(2)}`);

    console.log('\n' + '-'.repeat(60));
    console.log(`  TOTAL QUOTE: $${quote.total.toFixed(2)}`);
    console.log('='.repeat(60));

    // Return quote object for API/app usage
    return {
      success: true,
      quote: quote,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================================
// ADDITIONAL HELPER FUNCTIONS
// =============================================================================

/**
 * Validate quote calculations (for testing)
 */
function validateQuote(quote) {
  const checks = {
    hasArea: quote.measurements.lawnAreaSqFt > 0,
    hasPerimeter: quote.measurements.perimeterFt > 0,
    totalPositive: quote.total > 0,
    breakdownValid: quote.breakdown.mowingCost + quote.breakdown.edgingCost > 0,
    meetsMinimum: quote.total >= quote.breakdown.baseServiceFee
  };

  const allValid = Object.values(checks).every(v => v);

  return {
    valid: allValid,
    checks: checks
  };
}

/**
 * Export quote as JSON (for API response)
 */
function exportQuoteJSON(quoteResult) {
  return JSON.stringify(quoteResult, null, 2);
}

/**
 * Format quote for email/PDF
 */
function formatQuoteForCustomer(quote, customerInfo) {
  return `
LAWN MAINTENANCE QUOTE
${'='.repeat(50)}

Customer: ${customerInfo.name}
Property: ${customerInfo.address}
Date: ${new Date().toLocaleDateString()}

PROPERTY MEASUREMENTS:
  Lawn Area: ${quote.measurements.lawnAreaSqFt.toLocaleString()} sq ft
  Perimeter: ${quote.measurements.perimeterFt.toLocaleString()} ft

SERVICE DETAILS:
  ✓ Lawn Mowing: $${quote.breakdown.mowingCost.toFixed(2)}
  ${quote.configuration.includeEdging ? `✓ Edging: $${quote.breakdown.edgingCost.toFixed(2)}` : ''}

TOTAL: $${quote.total.toFixed(2)}

Thank you for your business!
  `;
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

if (require.main === module) {
  // Run the calculator
  const result = calculateLawnMaintenanceQuote();

  // Validate the quote
  if (result.success) {
    console.log('\n🔍 VALIDATION:');
    const validation = validateQuote(result.quote);
    console.log(`  Status: ${validation.valid ? '✓ VALID' : '✗ INVALID'}`);

    // Example customer info
    const customerInfo = {
      name: 'John Smith',
      address: '123 Main Street, Minneapolis, MN 55401'
    };

    // Generate customer-facing quote
    console.log('\n📧 CUSTOMER QUOTE:');
    console.log(formatQuoteForCustomer(result.quote, customerInfo));
  }
}

// =============================================================================
// EXPORTS (for use in larger application)
// =============================================================================

module.exports = {
  calculateLawnArea,
  calculateLawnPerimeter,
  calculateStructurePerimeters,
  generateQuote,
  validateQuote,
  exportQuoteJSON,
  formatQuoteForCustomer
};
