import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const supabaseUrl = 'https://fsmgynpdfxkaiiuguqyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWd5bnBkZnhrYWlpdWd1cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTg4ODYsImV4cCI6MjA2ODI3NDg4Nn0.unk2ST0Wcsw7RJz-BGrCqQpXSgLJQpAQPgJ-ImGCv-Q'

Deno.serve(async (req) => {
  try {
    // Erstelle Supabase Client mit Service Role für Admin-Zugriff
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🎓 Jährlicher Klassenwechsel gestartet...')

    // Hole alle Profile von Kindern (role = 'child')
    const { data: childProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, grade, role')
      .eq('role', 'child')
      .not('grade', 'is', null)

    if (fetchError) {
      console.error('❌ Fehler beim Laden der Kinderprofile:', fetchError)
      throw fetchError
    }

    if (!childProfiles || childProfiles.length === 0) {
      console.log('ℹ️ Keine Kinderprofile zum Aktualisieren gefunden')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Keine Kinderprofile gefunden',
          updated: 0 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    let updatedCount = 0
    const updates = []

    // Durchlaufe alle Kinderprofile und steigere die Klasse
    for (const child of childProfiles) {
      // Kinder in Klasse 12 bleiben in Klasse 12
      if (child.grade >= 12) {
        console.log(`📚 ${child.name} bleibt in Klasse 12`)
        continue
      }

      const newGrade = child.grade + 1
      
      // Aktualisiere die Klasse
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ grade: newGrade })
        .eq('id', child.id)

      if (updateError) {
        console.error(`❌ Fehler beim Aktualisieren von ${child.name}:`, updateError)
        continue
      }

      console.log(`✅ ${child.name}: Klasse ${child.grade} → Klasse ${newGrade}`)
      updatedCount++
      updates.push({
        id: child.id,
        name: child.name,
        oldGrade: child.grade,
        newGrade: newGrade
      })
    }

    console.log(`🎉 Klassenwechsel abgeschlossen! ${updatedCount} Kinder aktualisiert.`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Klassenwechsel erfolgreich abgeschlossen`,
        updated: updatedCount,
        details: updates
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Fehler beim jährlichen Klassenwechsel:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})