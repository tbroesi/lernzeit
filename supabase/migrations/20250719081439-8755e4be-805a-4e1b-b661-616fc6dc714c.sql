-- Vereinfachung der Settings-Struktur
-- Entfernen der parent_settings Tabelle, da nur child_settings verwendet werden

-- Löschen der parent_settings Tabelle
DROP TABLE IF EXISTS public.parent_settings;

-- Kommentar: Alle Einstellungen werden nun ausschließlich in child_settings gespeichert
-- Default-Werte werden im Code auf 1 Minute pro Aufgabe gesetzt
-- Alle Fächer sind standardmäßig sichtbar