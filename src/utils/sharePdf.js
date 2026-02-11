/**
 * Generate branded Temple Keepers PDFs for meal plans and shopping lists.
 * Uses jsPDF (client-side, no server needed).
 *
 * Usage:
 *   import { shareMealPlanPdf, shareShoppingListPdf } from '../utils/sharePdf'
 *   await shareMealPlanPdf(plan, days, mealTypes)
 *   await shareShoppingListPdf(items, title)
 */

// Lazy-load jsPDF to keep bundle lean
let jsPDFModule = null
async function getJsPDF() {
  if (!jsPDFModule) {
    try {
      jsPDFModule = await import('jspdf')
    } catch (err) {
      console.error('jsPDF not available:', err)
      throw new Error('PDF library not installed. Run: npm install jspdf')
    }
  }
  return jsPDFModule.jsPDF || jsPDFModule.default
}

// ─── Brand colours ───────────────────────────────────────
const PURPLE = [45, 27, 105]       // #2D1B69
const PURPLE_LIGHT = [107, 63, 160] // #6B3FA0
const GOLD = [212, 168, 67]         // #D4A843
const CREAM = [253, 251, 247]       // #FDFBF7
const DARK_TEXT = [30, 30, 40]
const MUTED_TEXT = [120, 115, 130]
const WHITE = [255, 255, 255]

// ─── Shared helpers ──────────────────────────────────────

function addHeader(doc, title, subtitle) {
  const w = doc.internal.pageSize.getWidth()

  // Purple header bar
  doc.setFillColor(...PURPLE)
  doc.rect(0, 0, w, 38, 'F')

  // Gold accent line
  doc.setFillColor(...GOLD)
  doc.rect(0, 38, w, 2, 'F')

  // Title
  doc.setTextColor(...WHITE)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 18)

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, 14, 28)
  }

  // Brand name right-aligned
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Temple Keepers', w - 14, 28, { align: 'right' })
}

function addFooter(doc, pageNum, totalPages) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  // Thin gold line
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.line(14, h - 16, w - 14, h - 16)

  // Footer text
  doc.setTextColor(...MUTED_TEXT)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('templekeepers.app', 14, h - 10)
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 14, h - 10, { align: 'right' })
}

function checkPageBreak(doc, y, needed = 30) {
  const h = doc.internal.pageSize.getHeight()
  if (y + needed > h - 24) {
    doc.addPage()
    return 50 // start position on new page (below header area)
  }
  return y
}

// ─── Meal Plan PDF ───────────────────────────────────────

export async function shareMealPlanPdf(plan, DAYS, MEAL_TYPES) {
  const jsPDF = await getJsPDF()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  const planTitle = plan.title || 'Weekly Meal Plan'

  // Build pages first to know total
  addHeader(doc, planTitle, 'Your weekly meal plan at a glance')

  let y = 50

  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  }

  const mealEmojis = {
    breakfast: 'B',
    lunch: 'L',
    dinner: 'D',
    snack: 'S',
  }

  DAYS.forEach((day, dayIndex) => {
    const dayMeals = (plan.meal_plan_days || []).filter(d => d.day_of_week === dayIndex)
    if (dayMeals.length === 0) return

    y = checkPageBreak(doc, y, 40)

    // Day header with purple background
    doc.setFillColor(107, 63, 160, 0.08)
    doc.setFillColor(240, 236, 248) // light purple tint
    doc.roundedRect(14, y - 5, w - 28, 9, 2, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PURPLE)
    doc.text(day, 18, y + 1.5)

    // Gold dot accent
    doc.setFillColor(...GOLD)
    doc.circle(w - 20, y - 0.5, 1.5, 'F')

    y += 10

    for (const type of MEAL_TYPES) {
      const meals = dayMeals.filter(m => m.meal_type === type)
      if (meals.length === 0) continue

      y = checkPageBreak(doc, y, 12)

      // Meal type label
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...GOLD)
      doc.text(mealLabels[type]?.toUpperCase() || type.toUpperCase(), 22, y)

      // Meal names
      const names = meals.map(m => m.recipes?.title || m.custom_meal_name || 'Custom meal').join(', ')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...DARK_TEXT)

      // Word-wrap long meal names
      const lines = doc.splitTextToSize(names, w - 72)
      doc.text(lines, 52, y)
      y += lines.length * 4.5 + 2
    }

    y += 4
  })

  // If no meals at all
  if ((plan.meal_plan_days || []).length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.setTextColor(...MUTED_TEXT)
    doc.text('No meals planned yet. Add recipes to your meal plan!', 14, y)
  }

  // Add footers to all pages
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    if (i > 1) addHeader(doc, planTitle, 'Your weekly meal plan at a glance')
    addFooter(doc, i, totalPages)
  }

  // Generate and share/download
  const blob = doc.output('blob')
  const filename = `Meal-Plan-${(plan.title || 'Weekly').replace(/\s+/g, '-')}.pdf`
  await shareOrDownload(blob, filename, planTitle)
}

// ─── Shopping List PDF ───────────────────────────────────

export async function shareShoppingListPdf(items, title) {
  const jsPDF = await getJsPDF()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  const listTitle = title || 'Shopping List'
  addHeader(doc, listTitle, 'Combined ingredients from your meal plan')

  let y = 50

  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)
  const totalCount = items.length
  const needCount = unchecked.length

  // Summary bar
  doc.setFillColor(240, 236, 248)
  doc.roundedRect(14, y - 4, w - 28, 10, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...PURPLE)
  doc.text(`${needCount} item${needCount !== 1 ? 's' : ''} to buy`, 18, y + 2)
  if (checked.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED_TEXT)
    doc.text(`${checked.length} already got`, w - 18, y + 2, { align: 'right' })
  }
  y += 14

  // Group by category
  const grouped = {}
  unchecked.forEach(item => {
    const cat = item.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  const catOrder = [
    'Produce', 'Protein', 'Dairy', 'Grains & Pasta',
    'Canned & Dry', 'Oils & Condiments', 'Spices', 'Nuts & Seeds', 'Other'
  ]

  const sortedCats = Object.keys(grouped).sort(
    (a, b) => (catOrder.indexOf(a) === -1 ? 99 : catOrder.indexOf(a)) -
              (catOrder.indexOf(b) === -1 ? 99 : catOrder.indexOf(b))
  )

  // Two-column layout for better space usage
  const colWidth = (w - 28) / 2
  const colStart = [14, 14 + colWidth + 4]
  let col = 0
  let colY = [y, y]

  for (const cat of sortedCats) {
    const catItems = grouped[cat]
    const neededHeight = 10 + catItems.length * 5.5

    // Pick the shorter column
    col = colY[0] <= colY[1] ? 0 : 1
    let cy = colY[col]

    cy = checkPageBreak(doc, cy, neededHeight > 60 ? 30 : neededHeight)
    if (cy === 50) {
      // Page broke — reset both columns
      colY = [50, 50]
      col = 0
      cy = 50
    }

    const x = colStart[col]

    // Category header
    doc.setFillColor(...PURPLE)
    doc.roundedRect(x, cy - 4, colWidth - 2, 8, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...WHITE)
    doc.text(cat, x + 4, cy + 1)
    cy += 8

    // Items
    for (const item of catItems) {
      cy = checkPageBreak(doc, cy, 7)
      if (cy === 50) {
        colY = [50, 50]
        col = 0
      }

      // Checkbox square
      doc.setDrawColor(...PURPLE_LIGHT)
      doc.setLineWidth(0.3)
      doc.rect(x + 2, cy - 2.8, 3, 3, 'S')

      // Quantity in gold
      const qty = item.amount ? `${item.amount}${item.unit ? ' ' + item.unit : ''}` : ''
      let textX = x + 8

      if (qty) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...GOLD)
        doc.text(qty, textX, cy)
        textX += doc.getTextWidth(qty) + 2
      }

      // Item name
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...DARK_TEXT)
      const maxNameWidth = x + colWidth - textX - 4
      const name = doc.splitTextToSize(item.name, maxNameWidth)[0] // single line truncate
      doc.text(name, textX, cy)

      cy += 5.5
    }

    cy += 3
    colY[col] = cy
  }

  // "Already got" section at the bottom
  y = Math.max(colY[0], colY[1]) + 4
  if (checked.length > 0) {
    y = checkPageBreak(doc, y, 10)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED_TEXT)
    const gotNames = checked.slice(0, 10).map(i => i.name).join(', ')
    const suffix = checked.length > 10 ? ` and ${checked.length - 10} more...` : ''
    doc.text(`Already got: ${gotNames}${suffix}`, 14, y)
  }

  // Add footers
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    if (i > 1) addHeader(doc, listTitle, 'Combined ingredients from your meal plan')
    addFooter(doc, i, totalPages)
  }

  const blob = doc.output('blob')
  const filename = 'Shopping-List.pdf'
  await shareOrDownload(blob, filename, listTitle)
}

// ─── Share or Download ───────────────────────────────────

async function shareOrDownload(blob, filename, title) {
  const file = new File([blob], filename, { type: 'application/pdf' })

  // Try native share (mobile — WhatsApp, iMessage, email, etc.)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, files: [file] })
      return
    } catch (err) {
      if (err.name === 'AbortError') return // user cancelled
      // Fall through to download
    }
  }

  // Fallback: trigger browser download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
