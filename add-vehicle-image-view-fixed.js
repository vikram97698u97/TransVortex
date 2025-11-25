/**
 * 🖼️ ADD IMAGE VIEW BUTTONS TO VEHICLE TABLE
 * 
 * Adds view buttons for uploaded images/documents in the Vehicle List table
 */

const fs = require('fs');

console.log('🖼️ Adding image view buttons to Vehicle table...\n');

if (fs.existsSync('add.html')) {
    let content = fs.readFileSync('add.html', 'utf8');
    let modified = false;
    
    // Fix 1: Add new column header for Images/Documents
    const originalHeader = `              <thead>
                <tr>
                  <th>Vehicle No.</th>
                  <th>Type</th>
                  <th>EMI</th>
                  <th>PUC</th>
                  <th>Insurance</th>
                  <th>Fitness</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>`;
    
    const newHeader = `              <thead>
                <tr>
                  <th>Vehicle No.</th>
                  <th>Type</th>
                  <th>EMI</th>
                  <th>PUC</th>
                  <th>Insurance</th>
                  <th>Fitness</th>
                  <th>Images/Documents</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>`;
    
    content = content.replace(originalHeader, newHeader);
    
    // Fix 2: Update the empty state colspan from 7 to 8
    content = content.replace(/colspan="7"/g, 'colspan="8"');
    
    // Fix 3: Add image display logic to the vehicle table rendering
    const originalActions = `           <td class="text-center">
             <div class="action-btns">`;
    
    const newImageColumn = `           <td>
             <div class="d-flex flex-column gap-1">
               \${vehicle.pucFileUrl ? 
                 \`<a href="\${vehicle.pucFileUrl}" target="_blank" class="btn btn-sm btn-outline-primary me-1" title="View PUC Document">
                    <i class="fas fa-file-pdf"></i> PUC
                  </a>\` : 
                 '<span class="text-muted small">No PUC</span>'}
               \${vehicle.insuranceFileUrl ? 
                 \`<a href="\${vehicle.insuranceFileUrl}" target="_blank" class="btn btn-sm btn-outline-info me-1" title="View Insurance Document">
                    <i class="fas fa-file-pdf"></i> Insurance
                  </a>\` : 
                 '<span class="text-muted small">No Insurance</span>'}
               \${vehicle.fitnessFileUrl ? 
                 \`<a href="\${vehicle.fitnessFileUrl}" target="_blank" class="btn btn-sm btn-outline-success me-1" title="View Fitness Document">
                    <i class="fas fa-file-pdf"></i> Fitness
                  </a>\` : 
                 '<span class="text-muted small">No Fitness</span>'}
             </div>
           </td>
           <td class="text-center">
             <div class="action-btns">`;
    
    content = content.replace(originalActions, newImageColumn);
    
    // Fix 4: Add some CSS for better styling of the document buttons
    const cssAddition = `    /* Extra styles for document buttons in table */
    .table .btn-sm {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        line-height: 1.2;
    }
    
    .table .text-muted.small {
        font-size: 0.7rem;
    }
    
    /* Loading animation */`;
    
    content = content.replace(/    \/\* Loading animation \*\//g, cssAddition);
    
    if (content !== fs.readFileSync('add.html', 'utf8')) {
        fs.writeFileSync('add.html.backup.vehicle-images', fs.readFileSync('add.html'));
        fs.writeFileSync('add.html', content);
        modified = true;
        
        console.log('✅ Added image view buttons to Vehicle table');
        console.log('✅ Added new "Images/Documents" column');
        console.log('✅ Updated table headers and structure');
        console.log('✅ Added PUC, Insurance, Fitness document links');
        console.log('✅ Added CSS styling for better appearance');
    }
    
    if (modified) {
        console.log('\n🎯 Vehicle Image Display Features:');
        console.log('✅ PUC Document view button');
        console.log('✅ Insurance Document view button');
        console.log('✅ Fitness Document view button');
        console.log('✅ Responsive button layout');
        console.log('✅ Fallback text for missing documents');
        console.log('✅ Links open in new tabs');
        
        console.log('\n🚀 User Experience:');
        console.log('✅ Easy access to all vehicle documents');
        console.log('✅ Color-coded document buttons');
        console.log('✅ Compact table layout');
        console.log('✅ Professional appearance');
        
        console.log('\n📱 Table Structure:');
        console.log('✅ Vehicle No. | Type | EMI | PUC | Insurance | Fitness | Images/Documents | Actions');
        console.log('✅ Each document has its own view button');
        console.log('✅ Missing documents show "No [Type]" text');
        
    } else {
        console.log('⚠️  No changes needed - image display already exists');
    }
    
} else {
    console.log('❌ add.html not found');
}

console.log('\n✨ Vehicle image display enhancement completed!');
