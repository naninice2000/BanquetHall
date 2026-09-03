const CC_EMAIL = "igrill.us@gmail.com";

function testDirectEmail() {
  Logger.log("Testing email dispatch...");
  const dummyData = {
    name: "Test Customer",
    phone: "(669) 230-6116",
    email: "igrill.us@gmail.com",
    eventDate: "2026-09-15",
    slot: "Dinner",
    adultGuests: "45",
    kidsGuests: "10",
    advancePaid: "$250.00",
    welcomeDrink: "Mango Mint Mojito (Famous)",
    item01: "Paneer 65 *",
    item02: "Chicken 65 *",
    item03: "Butter Chicken *",
    item04: "Dal Makhani",
    item05: "Hyderabadi Chicken Dum Biryani *",
    item06: "Gulab Jamun",
    rice: "Jeera Rice",
    bread: "Butter Naan, Garlic Naan",
    extraItems: "None",
    beverageAddons: "None",
    techPackage: "Basic Tech Package ($50)",
    tableClothsReq: "Yes",
    sashColors: "Gold, Maroon/Burgundy",
    ownLiquor: "No",
    usingDecorators: "No",
    servingTimes: "Appetizers @ 7:00 PM, Main @ 8:15 PM",
    specialRequests: "None"
  };
  sendMenuPdfEmail(dummyData);
  Logger.log("Test email executed!");
}

function doPost(e) {
  return handleMenuSubmission(e);
}

function doGet(e) {
  return handleMenuSubmission(e);
}

function handleMenuSubmission(e) {
  try {
    let params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    const data = {
      name: params.name || "Customer",
      phone: params.phone || "N/A",
      email: params.email || "",
      eventDate: params.eventDate || "N/A",
      slot: params.slot || "N/A",
      adultGuests: params.adultGuests || "30",
      kidsGuests: params.kidsGuests || "0",
      advancePaid: params.advancePaid || "$0.00",
      welcomeDrink: params.welcomeDrink || "Standard",
      item01: params.item01 || "None",
      item02: params.item02 || "None",
      item03: params.item03 || "None",
      item04: params.item04 || "None",
      item05: params.item05 || "None",
      item06: params.item06 || "None",
      rice: params.rice || "Standard",
      bread: params.bread || "Standard",
      extraItems: params.extraItems || "None",
      beverageAddons: params.beverageAddons || "None",
      techPackage: params.techPackage || "No Tech Package ($0)",
      tableClothsReq: params.tableClothsReq || "No",
      sashColors: params.sashColors || "None",
      ownLiquor: params.ownLiquor || "No",
      usingDecorators: params.usingDecorators || "No",
      decoratorName: params.decoratorName || "",
      decoratorAmount: params.decoratorAmount || "",
      decoratorPhone: params.decoratorPhone || "",
      servingTimes: params.servingTimes || "Standard",
      specialRequests: params.specialRequests || "None"
    };

    if (data.email) {
      sendMenuPdfEmail(data);
    }

    const callback = e && e.parameter ? e.parameter.callback : null;
    const resObj = { result: "success", message: "PDF emailed successfully" };

    if (callback) {
      return ContentService.createTextOutput(`${callback}(${JSON.stringify(resObj)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(JSON.stringify(resObj))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const callback = e && e.parameter ? e.parameter.callback : null;
    const errObj = { result: "error", message: err.toString() };

    if (callback) {
      return ContentService.createTextOutput(`${callback}(${JSON.stringify(errObj)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(errObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendMenuPdfEmail(data) {
  const tableClothsDisplay = data.tableClothsReq === "Yes" ? "Yes ($5 per table cloth)" : "No ($0)";
  const sashesDisplay = (data.sashColors && data.sashColors !== "None") ? `${data.sashColors} ($1 per guest)` : "None ($0)";

  const pdfHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Helvetica, Arial, sans-serif; color: #111827; margin: 20px; font-size: 11px; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #c59d5f; padding-bottom: 8px; margin-bottom: 12px; }
        .header h1 { color: #c59d5f; margin: 0; font-size: 18px; text-transform: uppercase; }
        .header p { color: #6b7280; margin: 2px 0 0 0; font-size: 10px; }
        .section-title { font-size: 11px; font-weight: bold; background: #fdf8f0; color: #78350f; padding: 4px 6px; border-left: 3px solid #c59d5f; margin: 10px 0 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        td { padding: 3px 5px; border-bottom: 1px solid #f3f4f6; }
        td.label { width: 30%; font-weight: bold; color: #4b5563; }
        td.val { width: 70%; color: #111827; }
        .tc-list { padding-left: 14px; margin: 4px 0; }
        .tc-list li { margin-bottom: 3px; font-size: 9.5px; color: #374151; }
        .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 15px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iGrill Banquet Hall</h1>
        <p>3170 De La Cruz Blvd, #131, Santa Clara, CA 95054 | Phone: (669) 230-6116</p>
        <p><strong>Official Banquet Menu, Order Confirmation & Agreed Terms</strong></p>
      </div>

      <div class="section-title">1. Customer & Reservation Details</div>
      <table>
        <tr><td class="label">Full Name:</td><td class="val">${data.name}</td></tr>
        <tr><td class="label">Phone / Email:</td><td class="val">${data.phone} | ${data.email}</td></tr>
        <tr><td class="label">Event Date & Slot:</td><td class="val">${data.eventDate} (${data.slot} Session)</td></tr>
        <tr><td class="label">Guest Counts:</td><td class="val">Adults (12+ yrs): ${data.adultGuests} | Kids (3+ yrs): ${data.kidsGuests}</td></tr>
        <tr><td class="label">Advance Paid:</td><td class="val">${data.advancePaid}</td></tr>
      </table>

      <div class="section-title">2. Package Selections ($20/Guest Base)</div>
      <table>
        <tr><td class="label">Welcome Drink:</td><td class="val">${data.welcomeDrink}</td></tr>
        <tr><td class="label">Item 01:</td><td class="val">${data.item01}</td></tr>
        <tr><td class="label">Item 02:</td><td class="val">${data.item02}</td></tr>
        <tr><td class="label">Item 03:</td><td class="val">${data.item03}</td></tr>
        <tr><td class="label">Item 04:</td><td class="val">${data.item04}</td></tr>
        <tr><td class="label">Item 05:</td><td class="val">${data.item05}</td></tr>
        <tr><td class="label">Item 06:</td><td class="val">${data.item06}</td></tr>
        <tr><td class="label">Rice Option:</td><td class="val">${data.rice}</td></tr>
        <tr><td class="label">Naan / Bread:</td><td class="val">${data.bread}</td></tr>
      </table>

      <div class="section-title">3. Optional Add-ons, Tech & Logistics</div>
      <table>
        <tr><td class="label">Extra Dishes:</td><td class="val">${data.extraItems}</td></tr>
        <tr><td class="label">Beverages & Platters:</td><td class="val">${data.beverageAddons}</td></tr>
        <tr><td class="label">Audio/Visual Tech:</td><td class="val">${data.techPackage}</td></tr>
        <tr><td class="label">White Table Cloths:</td><td class="val">${tableClothsDisplay}</td></tr>
        <tr><td class="label">Chair Sashes:</td><td class="val">${sashesDisplay}</td></tr>
        <tr><td class="label">Own Liquor / Decorator:</td><td class="val">Own Liquor: ${data.ownLiquor} | Using Decorator: ${data.usingDecorators}</td></tr>
        ${data.usingDecorators === "Yes" ? `
        <tr><td class="label">Name of the Decorator:</td><td class="val">${data.decoratorName || "N/A"}</td></tr>
        <tr><td class="label">Amount Paying For Decoration:</td><td class="val">${data.decoratorAmount || "N/A"}</td></tr>
        <tr><td class="label">Decorator Contact Number:</td><td class="val">${data.decoratorPhone || "N/A"}</td></tr>
        ` : ""}
        <tr><td class="label">Serving Schedule:</td><td class="val">${data.servingTimes}</td></tr>
        <tr><td class="label">Special Requests / Notes:</td><td class="val">${data.specialRequests}</td></tr>
      </table>

      <div class="section-title">4. Agreed Terms & Conditions</div>
      <ul class="tc-list">
        <li>I acknowledge $150 cleaning charges and 15% service charge will be added to the final bill.</li>
        <li>Party Bookings are non-refundable and non-transferable.</li>
        <li>Minimum of 50 adult guests will be charged for premium party slots (Saturday Lunch/Dinner & Sunday Lunch). Minimum of 30 adults will be charged for remaining slots.</li>
        <li>Full invoice must be paid a week before the event date. $250 advance (minus incidentals) is returned after event concludes.</li>
        <li>Charges are based on guest count provided during menu submission. Extra guests incur extra charges; no reductions if fewer show up.</li>
        <li>Revised guest counts must be sent at least a day before the event date.</li>
        <li>Charges are for food only. Hall services are limited to timely refilling of food choices.</li>
        <li>Additional service staff can be hired at $150 per person per 3 hours.</li>
        <li>Table cloths are charged at $5 for each table cloth[cite: 1].</li>
        <li>Hall must be vacated by 3 PM for Lunch or 10 PM for Dinner. $50 per extra 30 minutes applies.</li>
        <li>Last food refill: Welcome drink/starters/salads at 12:30 PM (Lunch) & 8:00 PM (Dinner); remaining items at 1:30 PM (Lunch) & 9:00 PM (Dinner).</li>
        <li>Do NOT nail, staple, tack, wheat-paste, double-sided, or duct tape to walls (scotch/removable poster tape only).</li>
        <li>Bringing own alcohol incurs Corkage Fee of $2/Adult Guest or $100 (higher of the two).</li>
        <li>Special party requests outside these T&Cs must be submitted via email to igrill.us@gmail.com[cite: 1].</li>
        <li>Children must be supervised at all times and not left unattended.</li>
        <li>Party hall food cannot be taken home; to-go boxes are not provided.</li>
        <li><strong>Status:</strong> Acknowledged and accepted by customer upon menu submission.</li>
      </ul>

      <div class="footer">
        Generated by iGrill Event Management. Official digital agreement record.
      </div>
    </body>
    </html>
  `;

  const pdfBlob = Utilities.newBlob(pdfHtml, "text/html", "Banquet_Menu_Selection.html")
                           .getAs("application/pdf")
                           .setName(`iGrill_Banquet_Menu_${data.name.replace(/\s+/g, "_")}.pdf`);

  MailApp.sendEmail({
    to: data.email,
    cc: CC_EMAIL,
    replyTo: CC_EMAIL,
    name: "iGrill Banquet Team",
    subject: `Banquet Hall Menu Confirmation: ${data.name} for ${data.eventDate} (${data.slot})`,
    body: `Hi ${data.name},\n\nThank you for submitting your banquet hall menu selections! Attached is the official PDF copy of your menu summary, logistics, and agreed terms and conditions for your records.\n\nBest Regards,\nBanquet Manager\niGrill Kababs & Biryanis\n(669) 230-6116 | https://igrill.us`,
    attachments: [pdfBlob]
  });
}