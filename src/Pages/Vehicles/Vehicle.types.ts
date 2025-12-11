export interface Vehicle {
    id:any
    // Basic Information
    vehicle_number: string;
    vehicle_type: string;
    rc_number: string;
    rc_isued_date: string;
    rc_expiry_date: string;
    manufacturer: string;
    vehicle_model?: string;
    manufacturing_year?: string;
    fuel_type?: string;
    seating_capacity?: number;
    vehicle_color?: string;
    kilometers_driven?: number;
    driver?: string;
    route?: string;

    // Tracking
    gps_device?: string;
    gps_installation_date?: string;

    // Permit & Compliance
    permit_type?: string;
    permit_number?: string;
    permit_issue_date?: string;
    permit_expiry_date?: string;

    // Ownership
    ownership_type?: string;
    // if type selected contract then show fields 
    vendor_name?: string;
    vendor_aadhar_number?: string;
    vendor_pan_number?: string;
    vendor_contact_number?: string;
    vendor_organization_name?: string;

    // Insurance & Fitness
    insurance_provider_name?: string;
    insurance_policy_number?: string;
    insurance_issued_date?: string;
    insurance_expiry_date?: string;
    fitness_certificate_number?: string;
    fitness_issued_date?: string;
    fitness_expiry_date?: string;
    pollution_certificate_number?: string;
    pollution_issued_date?: string;
    pollution_expiry_date?: string;
    tax_renewable_date?:string;

    // Service & Maintenance
    last_service_date?: string;
    next_service_due_date?: string;
    tyre_replacement_due_date?: string;
    battery_replacement_due_date?: string;

    // Safety (select Yes/No)
    fire_extinguisher?: string;
    first_aid_kit?: string;
    cctv_installed?: string;
    panic_button_installed?: string;

    remarks?: string;
    status?: string;

    // documents
    insurance_doc?: string;
    rc_book_doc?: string;
    puc_doc?: string;
    fitness_certificate?: string;
    permit_copy?: string;
    gps_installation_proof?: string;
    saftey_certificate?:string;
    vendor_pan?: string;
    vendor_adhaar?: string;
    vendor_bank_proof?: string;
    vendor_contract_proof?: string;
    vedor_company_registration_doc?: string;
}