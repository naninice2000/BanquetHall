const SHEET_NAME = "BOOKINGS";
const CC_EMAIL = "igrill.us@gmail.com";

const MONTH_MAP = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

function normalizeDateToYMD(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  const match = str.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (match) {
    const m = MONTH_MAP[match[1].toLowerCase()];
    const d = String(match[2]).padStart(2, '0');
    const y = match[3];
    if (m) return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  return "";
}

function formatDatePretty(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

// 1-Click test function to verify Gmail permissions inside script editor
function testDirectEmail() {
  Logger.log("Testing email dispatch...");
  sendInquiryEmail(
    "igrill.us@gmail.com",
    "Venkata Test",
    "2026-08-24",
    "Dinner",
    "50",
    "10"
  );
  Logger.log("Email dispatch complete.");
}

function sendInquiryEmail(customerEmail, customerName, dateStr, slot, adultsCount, kidsCount) {
  if (!customerEmail) return;

  const prettyDate = formatDatePretty(dateStr);
  const subject = `Banquet Hall Enquiry: ${customerName} for ${prettyDate} (${slot})`;

  // Plain Text Fallback
  const plainTextBody = `Hi,

Thank you for your inquiry! Desired slot is available for booking.

Inquiry Date: ${prettyDate} (${slot})
Adults Guest count: ${adultsCount}
Kids Guest Count: ${kidsCount}

PLEASE NOTE THAT WE CHARGE A MINIMUM OF 50 ADULTS FOR SATURDAY LUNCH / DINNER AND SUNDAY LUNCH SLOTS.

Video of our banquet hall with decorations: https://youtu.be/sv1DyUmg6rs

You can block the date by paying $250 in advance towards the booking. You can make the payment via Zelle or Venmo or PayPal (pls choose option that has no processing fee) to iGrill.US@gmail.com. You can also pay at the restaurant. Any option that is easy for you works for us.

Optionally, Table cloths are $5 per table; Chair Sashes are $1 per guest. Please make your selections at the time of menu submission. Menu submission form will walk you through these selections

Note: For all other decoration needs, please work with:
1. Nwreen of Classic Creation (+1 (650) 430-0677)
https://www.facebook.com/eventsbyclassiccreation/
https://instagram.com/classic.creation.events?igshid=s1gggqdyqbkg

2. Bindu: +1 (425)-469-0660, Charan: +1 (571)-421-4321
Decoration: https://www.instagram.com/karmanya_kreatives?igsh=OGQ5ZDc2ODk2ZA%3D%3D&utm_source=qr
Email: karmanyakreatives@gmail.com

We do not allow outside decorators unless they are contracted with us.

At least two weeks before the event date, please submit your menu from this link: https://igrill.us/menu-selection

Please review all terms and conditions before you make the booking: https://igrill.us/banquet-hall

Best Regards,
Venkatesh (Manager)
IGrill Kababs & Biryanis
Website: https://igrill.us
Phone: +1 (669) 230-6116`;

  // Standardized Rich HTML Body (Renders identically across all mail clients)
  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #222222; line-height: 1.6; max-width: 650px;">
      <p>Hi,</p>
      
      <p>Thank you for your inquiry! Desired slot is available for booking.</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #c59d5f; padding: 12px 16px; margin: 18px 0;">
        <p style="margin: 4px 0;"><strong>Inquiry Date:</strong> ${prettyDate} (${slot})</p>
        <p style="margin: 4px 0;"><strong>Adults Guest count:</strong> ${adultsCount}</p>
        <p style="margin: 4px 0;"><strong>Kids Guest Count:</strong> ${kidsCount}</p>
      </div>

      <p style="color: #b91c1c; font-weight: bold; margin: 16px 0;">
        PLEASE NOTE THAT WE CHARGE A MINIMUM OF 50 ADULTS FOR SATURDAY LUNCH / DINNER AND SUNDAY LUNCH SLOTS.
      </p>

      <p>
        <strong>Video of our banquet hall with decorations:</strong><br>
        <a href="https://youtu.be/sv1DyUmg6rs" style="color: #c59d5f; text-decoration: underline;" target="_blank">Watch Video on YouTube</a>
      </p>

      <p>
        You can block the date by paying <strong>$250</strong> in advance towards the booking. You can make the payment via <strong>Zelle, Venmo, or PayPal</strong> (pls choose option that has no processing fee) to <strong>iGrill.US@gmail.com</strong>. You can also pay at the restaurant. Any option that is easy for you works for us.
      </p>

      <p>
        Optionally, <strong>Table cloths are $5 per table; Chair Sashes are $1 per guest</strong>. Please make your selections at the time of menu submission. Menu submission form will walk you through these selections.
      </p>

      <div style="background-color: #fbfbfb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; margin: 18px 0;">
        <p style="margin-top: 0; font-weight: bold; color: #111827;">Note: For all other decoration needs, please work with:</p>
        <ol style="margin-bottom: 0; padding-left: 20px;">
          <li style="margin-bottom: 10px;">
            <strong>Nwreen of Classic Creation</strong> (<a href="tel:+16504300677" style="color: #c59d5f;">+1 (650) 430-0677</a>)<br>
            <a href="https://www.facebook.com/eventsbyclassiccreation/" style="color: #c59d5f; text-decoration: underline;" target="_blank">Facebook</a> | 
            <a href="https://instagram.com/classic.creation.events?igshid=s1gggqdyqbkg" style="color: #c59d5f; text-decoration: underline;" target="_blank">Instagram</a>
          </li>
          <li>
            <strong>Bindu:</strong> <a href="tel:+14254690660" style="color: #c59d5f;">+1 (425)-469-0660</a>, <strong>Charan:</strong> <a href="tel:+15714214321" style="color: #c59d5f;">+1 (571)-421-4321</a><br>
            <strong>Decoration:</strong> <a href="https://www.instagram.com/karmanya_kreatives?igsh=OGQ5ZDc2ODk2ZA%3D%3D&utm_source=qr" style="color: #c59d5f; text-decoration: underline;" target="_blank">Instagram</a><br>
            <strong>Email:</strong> <a href="mailto:karmanyakreatives@gmail.com" style="color: #c59d5f;">karmanyakreatives@gmail.com</a>
          </li>
        </ol>
        <p style="margin-bottom: 0; margin-top: 10px; font-size: 13px; color: #6b7280;"><em>* We do not allow outside decorators unless they are contracted with us.</em></p>
      </div>

      <p>
        At least two weeks before the event date, please submit your menu from this link:<br>
        <a href="https://igrill.us/menu-selection" style="color: #c59d5f; font-weight: bold; text-decoration: underline;" target="_blank">https://igrill.us/menu-selection</a>
      </p>

      <p>
        Please review all terms and conditions before you make the booking:<br>
        <a href="https://igrill.us/banquet-hall" style="color: #c59d5f; font-weight: bold; text-decoration: underline;" target="_blank">https://igrill.us/banquet-hall</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px 0;" />

      <p style="margin-bottom: 4px;"><strong>Best Regards,</strong></p>
      <p style="margin: 0; color: #111827; font-weight: bold;">Venkatesh (Manager)</p>
      <p style="margin: 0; color: #c59d5f; font-weight: bold;">IGrill Kababs & Biryanis</p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
        <a href="https://igrill.us" style="color: #c59d5f; text-decoration: none;" target="_blank">Website</a> | 
        <a href="https://facebook.com" style="color: #c59d5f; text-decoration: none;" target="_blank">Facebook</a> | 
        <a href="https://instagram.com" style="color: #c59d5f; text-decoration: none;" target="_blank">Instagram</a>
      </p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Phone: <a href="tel:+16692306116" style="color: #111827; text-decoration: none; font-weight: 500;">+1 (669) 230-6116</a></p>
    </div>
  `;

  try {
    GmailApp.sendEmail(customerEmail, subject, plainTextBody, {
      cc: CC_EMAIL,
      htmlBody: htmlBody,
      name: "iGrill Banquet Team"
    });
  } catch (err) {
    MailApp.sendEmail({
      to: customerEmail,
      cc: CC_EMAIL,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody,
      name: "iGrill Banquet Team"
    });
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  const callback = e.parameter.callback;

  // 1. Process Form Inquiry Submission
  if (e.parameter && e.parameter.action === "submitInquiry") {
    const lock = LockService.getScriptLock();
    lock.tryLock(15000);
    try {
      const data = sheet.getDataRange().getValues();
      const displayData = sheet.getDataRange().getDisplayValues();

      const targetDate = String(e.parameter.date || '').trim();
      const targetSlot = String(e.parameter.slot || '').trim();
      const customerName = String(e.parameter.name || '').trim();
      const customerEmail = String(e.parameter.email || '').trim();
      const customerPhone = String(e.parameter.phone || '').trim();
      const adults = String(e.parameter.adultGuests || '0').trim();
      const kids = String(e.parameter.kidsGuests || '0').trim();
      const eventType = String(e.parameter.eventType || '').trim();
      const notes = String(e.parameter.notes || 'None').trim();

      const comments = `Inquiry: Name: ${customerName} | Email: ${customerEmail} | Phone: ${customerPhone} | Estimated Adult Guest Count: ${adults} | Estimated Kids Guest Count (3+ age): ${kids} | Event Type: ${eventType} | Notes: ${notes}`;

      let rowFound = false;

      for (let i = 1; i < data.length; i++) {
        const rowDateKey = normalizeDateToYMD(data[i][0]) || normalizeDateToYMD(displayData[i][0]);
        const rowSlot = String(displayData[i][2] || data[i][2] || '').trim().toLowerCase();

        if (rowDateKey === targetDate && rowSlot === targetSlot.toLowerCase()) {
          const rowNum = i + 1;
          sheet.getRange(rowNum, 4).setValue('TempHold');
          sheet.getRange(rowNum, 5).setValue(customerName);
          sheet.getRange(rowNum, 6).setValue(customerEmail);
          sheet.getRange(rowNum, 7).setValue(customerPhone);
          sheet.getRange(rowNum, 11).setValue(comments);
          SpreadsheetApp.flush();
          rowFound = true;
          break;
        }
      }

      if (!rowFound) {
        const d = new Date(targetDate + "T00:00:00");
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const displayDateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        sheet.appendRow([
          displayDateStr,
          dayName,
          targetSlot,
          "TempHold",
          customerName,
          customerEmail,
          customerPhone,
          "",
          "",
          "",
          comments
        ]);
        SpreadsheetApp.flush();
      }

      // Send identical HTML template email
      sendInquiryEmail(customerEmail, customerName, targetDate, targetSlot, adults, kids);

      const resObj = { result: "success" };
      if (callback) {
        return ContentService.createTextOutput(`${callback}(${JSON.stringify(resObj)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(resObj))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      const errObj = { result: "error", message: err.toString() };
      if (callback) {
        return ContentService.createTextOutput(`${callback}(${JSON.stringify(errObj)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(errObj))
        .setMimeType(ContentService.MimeType.JSON);
    } finally {
      lock.releaseLock();
    }
  }

  // 2. Fetch Availability Data (JSONP + standard JSON fallback)
  const data = sheet.getDataRange().getValues();
  const displayData = sheet.getDataRange().getDisplayValues();
  const availability = [];

  for (let i = 1; i < data.length; i++) {
    const dateKey = normalizeDateToYMD(data[i][0]) || normalizeDateToYMD(displayData[i][0]);
    const slot = String(displayData[i][2] || data[i][2] || '').trim();
    const status = String(displayData[i][3] || data[i][3] || '').trim();

    if (dateKey && slot) {
      availability.push({
        date: dateKey,
        slot: slot,
        isOpen: status.toLowerCase() === 'open'
      });
    }
  }

  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(availability)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(availability))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  return doGet(e);
}