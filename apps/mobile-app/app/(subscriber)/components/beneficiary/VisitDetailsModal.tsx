import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { sanitizeImageUri } from '@/utils/sanitizeImageUri';
import { ConnectContactButton } from '@/components/shared/ConnectContactModal';

const DEEP_ORANGE = '#FE6700';

export interface VisitDetailData {
  id: string;
  encounterId?: string;
  status?: string;
  companionName?: string;
  companionPhoto?: string;
  companionPhone?: string | null;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduledTimeRange?: string;
  dateStr?: string;
  duration?: string;
  actualDurationMinutes?: number | null;
  durationText?: string;
  rated?: boolean;
  rating?: number | null;
  beneficiaryRating?: number | null;
  activities?: string[];
  bp?: string | null;
  heartRate?: string | null;
  bloodSugar?: string | null;
  notes?: string | null;
  // Detailed fields
  checkInTime?: string | null;
  checkInTimeIso?: string | null;
  checkInType?: string;
  isGeoVerified?: boolean;
  geoDistanceMeters?: number | null;
  manualCheckInReason?: string | null;
  checkOutTime?: string | null;
  checkOutTimeIso?: string | null;
  checkOutType?: string;
  manualCheckOutReason?: string | null;
  mood?: string;
  medicationAdherence?: boolean;
  medications?: Array<{
    id: string;
    name: string;
    dosage?: string | null;
    instructions?: string | null;
    taken: boolean;
  }>;
  vitals?: Array<{
    id?: string;
    name: string;
    code?: string;
    value: string;
    unit?: string;
  }>;
  photos?: string[];
}

interface VisitDetailsModalProps {
  visible: boolean;
  visit: VisitDetailData | null;
  onClose: () => void;
  onRatePress?: () => void;
}

// ── Header Graphic Illustration ──────────────────────────────────────────────
const ClipboardIllustration = () => (
  <View style={styles.graphicContainer}>
    {/* Background soft leaves/blob */}
    <View style={styles.graphicBlob} />
    {/* Clipboard Base */}
    <View style={styles.clipboardBase}>
      {/* Top Clip */}
      <View style={styles.clipboardClip} />
      {/* Lines & Checks */}
      <View style={styles.clipContent}>
        <View style={styles.clipRow}>
          <Ionicons name="checkmark" size={10} color="#0284C7" />
          <View style={[styles.clipLine, { width: 28 }]} />
        </View>
        <View style={styles.clipRow}>
          <Ionicons name="checkmark" size={10} color="#0284C7" />
          <View style={[styles.clipLine, { width: 22 }]} />
        </View>
        <View style={styles.clipRow}>
          <View style={[styles.clipLine, { width: 32, marginLeft: 12 }]} />
        </View>
      </View>
      {/* Floating Checkmark Badge */}
      <View style={styles.floatingBadge}>
        <Ionicons name="checkmark" size={15} color="#FFFFFF" />
      </View>
    </View>
  </View>
);

export function VisitDetailsModal({
  visible,
  visit,
  onClose,
  onRatePress,
}: VisitDetailsModalProps) {
  const { height } = useWindowDimensions();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  if (!visit) return null;

  const isCompleted = visit.status === 'completed' || !visit.status;

  // Format date helper: "2026-06-11 • 05:03 pm - 05:04 pm" -> "11 Jun 2026 • 05:03 pm – 05:04 pm"
  const getFormattedDateSubtitle = (rawDateStr?: string) => {
    if (!rawDateStr) return 'Recent Visit Encounter';
    const parts = rawDateStr.split('•');
    const datePart = parts[0]?.trim();
    const timePart = parts[1]?.trim();

    let prettyDate = datePart;
    if (datePart && datePart.includes('-')) {
      const d = new Date(datePart);
      if (!isNaN(d.getTime())) {
        prettyDate = d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }

    if (timePart) {
      const cleanTime = timePart.replace(/-/g, '–');
      return `${prettyDate} • ${cleanTime}`;
    }
    return prettyDate;
  };

  // Mood helper
  const getMoodMeta = (m?: string) => {
    const raw = (m || 'neutral').toLowerCase();
    switch (raw) {
      case 'happy':
        return { emoji: '😊', label: 'Happy & Energetic', bg: '#F0FDF4', border: '#DCFCE7', color: '#16A34A' };
      case 'neutral':
        return { emoji: '😐', label: 'Neutral & Calm', bg: '#F8FAFC', border: '#E2E8F0', color: '#475569' };
      case 'sad':
        return { emoji: '😔', label: 'Sad / Low Mood', bg: '#FFFBEB', border: '#FEF3C7', color: '#D97706' };
      case 'anxious':
        return { emoji: '⚡', label: 'Anxious / Restless', bg: '#FEF2F2', border: '#FEE2E2', color: '#DC2626' };
      case 'depressed':
        return { emoji: '🌧️', label: 'Depressed / Lethargic', bg: '#FAF5FF', border: '#F3E8FF', color: '#7E22CE' };
      default:
        return { emoji: '😊', label: visit.mood || 'Good', bg: '#F0FDF4', border: '#DCFCE7', color: '#16A34A' };
    }
  };

  const moodMeta = getMoodMeta(visit.mood);

  // Vital icon & color resolver
  const getVitalMeta = (code?: string, name?: string) => {
    const c = (code || '').toUpperCase();
    const n = (name || '').toLowerCase();
    if (c === 'BP' || n.includes('blood pressure')) {
      return { icon: 'blood-bag', color: '#DC2626', bg: '#FEE2E2', lib: 'mci' };
    }
    if (c === 'PULSE' || c === 'HEART_RATE' || n.includes('pulse') || n.includes('heart')) {
      return { icon: 'heart-pulse', color: '#E11D48', bg: '#FFE4E6', lib: 'mci' };
    }
    if (c === 'SPO2' || c === 'OXYGEN_LEVEL' || n.includes('oxygen') || n.includes('spo2')) {
      return { icon: 'air-humidifier', color: '#059669', bg: '#D1FAE5', lib: 'mci' };
    }
    if (c === 'TEMP' || c === 'TEMPERATURE' || n.includes('temp')) {
      return { icon: 'thermometer', color: '#0284C7', bg: '#E0F2FE', lib: 'mci' };
    }
    if (c === 'BLOOD_GLUCOSE' || n.includes('sugar') || n.includes('glucose')) {
      return { icon: 'water', color: '#D97706', bg: '#FEF3C7', lib: 'mci' };
    }
    if (c === 'WEIGHT' || n.includes('weight')) {
      return { icon: 'scale-bathroom', color: '#4F46E5', bg: '#EEF2FF', lib: 'mci' };
    }
    return { icon: 'pulse', color: '#64748B', bg: '#F1F5F9', lib: 'ion' };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxHeight: height * 0.94 }]}>
          
          {/* ── Top Navigation Bar (Back + Close) ── */}
          <View style={styles.topNavRow}>
            <TouchableOpacity style={styles.navCircleBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCircleBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* ── Header Title & Graphic Area ── */}
          <View style={styles.headerHero}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              {/* Badge Row */}
              <View style={styles.badgeRow}>
                <View style={styles.encounterBadge}>
                  <Text style={styles.encounterBadgeText}>
                    {visit.encounterId || 'V-1781177546285-831'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, isCompleted ? styles.statusCompleted : styles.statusProgress]}>
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'time'}
                    size={13}
                    color={isCompleted ? '#16A34A' : '#D97706'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.statusBadgeText, isCompleted ? { color: '#16A34A' } : { color: '#D97706' }]}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
              </View>

              {/* Main Title */}
              <Text style={styles.heroTitle}>Visit Summary Report</Text>

              {/* Subtitle with Calendar Icon */}
              <View style={styles.heroSubRow}>
                <Ionicons name="calendar-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.heroSubText}>
                  {getFormattedDateSubtitle(visit.dateStr)}
                </Text>
              </View>
            </View>

            {/* Aesthetic Clipboard Graphic */}
            <ClipboardIllustration />
          </View>

          {/* ── Scrollable Body ── */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── 1. Care Companion Profile Card (Clean Mockup Style) ── */}
            <View style={styles.companionCard}>
              <Image
                source={{
                  uri: sanitizeImageUri(
                    visit.companionPhoto,
                    'https://randomuser.me/api/portraits/women/1.jpg'
                  ),
                }}
                style={styles.companionAvatar}
              />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.companionName}>
                  {visit.companionName || 'Aarav Sharma'}
                </Text>
                <Text style={styles.companionRole}>Dedicated Care Companion</Text>
                {visit.duration ? (
                  <View style={styles.durationChip}>
                    <Ionicons name="time-outline" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                    <Text style={styles.durationChipText}>{visit.duration}</Text>
                  </View>
                ) : null}
              </View>
              <ConnectContactButton
                name={visit.companionName || 'Care Companion'}
                role="Care Companion"
                phone={visit.companionPhone || null}
                photo={visit.companionPhoto}
              />
            </View>

            {/* ── 2. Arrival & Departure Verification ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={18} color="#0284C7" />
                <Text style={styles.sectionTitle}>Visit Timing & Verification</Text>
              </View>

              {/* Scheduled Timing Banner */}
              {(visit.scheduledTimeRange || visit.scheduledStartTime) ? (
                <View style={{
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={15} color="#16A34A" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                      Scheduled: {visit.scheduledTimeRange || visit.scheduledStartTime}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803D' }}>
                    {visit.duration || '60 mins'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.checkInOutGrid}>
                {/* Check-in Block */}
                <View style={styles.checkBlock}>
                  <View style={styles.checkBlockHeader}>
                    <Ionicons name="log-in-outline" size={16} color="#059669" />
                    <Text style={styles.checkBlockLabel}>Check-in</Text>
                  </View>
                  <Text style={styles.checkTimeText}>
                    {visit.checkInTime || '05:03 pm'}
                  </Text>
                  <View style={[styles.typePill, visit.isGeoVerified ? styles.typePillGeo : (visit.manualCheckInReason ? styles.typePillManual : styles.typePillGeo)]}>
                    <Ionicons
                      name={visit.isGeoVerified ? 'shield-checkmark' : (visit.manualCheckInReason ? 'alert-circle' : 'shield-checkmark')}
                      size={12}
                      color={visit.isGeoVerified ? '#16A34A' : (visit.manualCheckInReason ? '#D97706' : '#16A34A')}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.typePillText, visit.isGeoVerified ? { color: '#16A34A' } : (visit.manualCheckInReason ? { color: '#B45309' } : { color: '#16A34A' })]}>
                      {visit.isGeoVerified
                        ? `Geo-verified (${visit.geoDistanceMeters ?? 15}m)`
                        : visit.manualCheckInReason
                        ? 'Manual Check-in (Flagged)'
                        : visit.checkInType || 'Standard Check-in'}
                    </Text>
                  </View>
                  {visit.manualCheckInReason ? (
                    <Text style={styles.manualNoteText}>
                      Reason: {visit.manualCheckInReason}
                    </Text>
                  ) : null}
                </View>

                {/* Check-out Block */}
                <View style={styles.checkBlock}>
                  <View style={styles.checkBlockHeader}>
                    <Ionicons name="log-out-outline" size={16} color="#0284C7" />
                    <Text style={styles.checkBlockLabel}>Check-out</Text>
                  </View>
                  <Text style={styles.checkTimeText}>
                    {visit.checkOutTime || '05:04 pm'}
                  </Text>
                  <View style={[styles.typePill, !visit.manualCheckOutReason ? styles.typePillGeo : styles.typePillManual]}>
                    <Ionicons
                      name={!visit.manualCheckOutReason ? 'shield-checkmark' : 'information-circle'}
                      size={12}
                      color={!visit.manualCheckOutReason ? '#16A34A' : '#D97706'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.typePillText, !visit.manualCheckOutReason ? { color: '#16A34A' } : { color: '#B45309' }]}>
                      {visit.checkOutType || 'Standard Check-out'}
                    </Text>
                  </View>
                  {visit.manualCheckOutReason ? (
                    <Text style={styles.manualNoteText}>
                      Reason: {visit.manualCheckOutReason}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* ── 3. Beneficiary Mood & Well-being ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={18} color="#DB2777" />
                <Text style={styles.sectionTitle}>Beneficiary Mood & Well-being</Text>
              </View>
              <View style={[styles.moodBanner, { backgroundColor: moodMeta.bg, borderColor: moodMeta.border }]}>
                <View style={styles.moodEmojiContainer}>
                  <Text style={styles.moodEmoji}>{moodMeta.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.moodHeading}>
                    {visit.mood || 'Neutral'}
                  </Text>
                  <Text style={styles.moodDescription}>{moodMeta.label}</Text>
                </View>
              </View>
            </View>

            {/* ── 4. Recorded Vital Signs ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pulse" size={18} color="#DC2626" />
                <Text style={styles.sectionTitle}>Recorded Vital Signs</Text>
              </View>

              {visit.vitals && visit.vitals.length > 0 ? (
                <View style={styles.vitalsGrid}>
                  {visit.vitals.map((vt, idx) => {
                    const meta = getVitalMeta(vt.code, vt.name);
                    return (
                      <View key={idx} style={styles.vitalCard}>
                        <View style={[styles.vitalIconWrap, { backgroundColor: meta.bg }]}>
                          {meta.lib === 'mci' ? (
                            <MaterialCommunityIcons name={meta.icon as any} size={18} color={meta.color} />
                          ) : (
                            <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                          )}
                        </View>
                        <Text style={styles.vitalName} numberOfLines={1}>{vt.name}</Text>
                        <Text style={styles.vitalValue}>{vt.value}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (visit.bp || visit.heartRate || visit.bloodSugar) ? (
                <View style={styles.vitalsGrid}>
                  {visit.bp ? (
                    <View style={styles.vitalCard}>
                      <View style={[styles.vitalIconWrap, { backgroundColor: '#FEE2E2' }]}>
                        <MaterialCommunityIcons name="blood-bag" size={18} color="#DC2626" />
                      </View>
                      <Text style={styles.vitalName}>Blood Pressure</Text>
                      <Text style={styles.vitalValue}>{visit.bp}</Text>
                    </View>
                  ) : null}
                  {visit.heartRate ? (
                    <View style={styles.vitalCard}>
                      <View style={[styles.vitalIconWrap, { backgroundColor: '#FFE4E6' }]}>
                        <MaterialCommunityIcons name="heart-pulse" size={18} color="#E11D48" />
                      </View>
                      <Text style={styles.vitalName}>Pulse / Heart Rate</Text>
                      <Text style={styles.vitalValue}>{visit.heartRate}</Text>
                    </View>
                  ) : null}
                  {visit.bloodSugar ? (
                    <View style={styles.vitalCard}>
                      <View style={[styles.vitalIconWrap, { backgroundColor: '#FEF3C7' }]}>
                        <MaterialCommunityIcons name="water" size={18} color="#D97706" />
                      </View>
                      <Text style={styles.vitalName}>Blood Sugar</Text>
                      <Text style={styles.vitalValue}>{visit.bloodSugar}</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={styles.emptyNoticeBox}>
                  <Ionicons name="pulse-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyNoticeText}>No clinical vitals were recorded for this encounter.</Text>
                </View>
              )}
            </View>

            {/* ── 5. Medications Verification ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="pill" size={18} color="#9333EA" />
                <Text style={styles.sectionTitle}>Medications Verification</Text>
              </View>

              {visit.medications && visit.medications.length > 0 ? (
                <View style={styles.medsList}>
                  {visit.medications.map((m, idx) => (
                    <View key={m.id || idx} style={styles.medItem}>
                      <View style={[styles.medStatusIcon, m.taken ? styles.medTakenBg : styles.medMissedBg]}>
                        <Ionicons
                          name={m.taken ? 'checkmark-circle' : 'close-circle'}
                          size={18}
                          color={m.taken ? '#16A34A' : '#DC2626'}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.medItemName}>{m.name}</Text>
                        {m.dosage ? (
                          <Text style={styles.medItemDosage}>{m.dosage}</Text>
                        ) : null}
                        {m.instructions ? (
                          <Text style={styles.medItemInstructions}>{m.instructions}</Text>
                        ) : null}
                      </View>
                      <View style={[styles.medStatusChip, m.taken ? styles.medStatusChipTaken : styles.medStatusChipMissed]}>
                        <Text style={[styles.medStatusChipText, m.taken ? { color: '#16A34A' } : { color: '#DC2626' }]}>
                          {m.taken ? 'Taken ✓' : 'Missed ✗'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyNoticeBox}>
                  <MaterialCommunityIcons name="pill" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyNoticeText}>No specific prescription schedule was flagged during this visit.</Text>
                </View>
              )}
            </View>

            {/* ── 6. Clinical & Care Notes ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Observations & Notes</Text>
              </View>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>
                  {visit.notes || 'No special clinical remarks were recorded by the Care Companion for this visit.'}
                </Text>
              </View>
            </View>

            {/* ── 7. Photos Uploaded by Care Companion ── */}
            {visit.photos && visit.photos.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="images" size={18} color="#0891B2" />
                  <Text style={styles.sectionTitle}>
                    Visit Photos ({visit.photos.length})
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosStrip}>
                  {visit.photos.map((uri, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.85}
                      onPress={() => setPreviewPhoto(uri)}
                      style={styles.photoThumbWrapper}
                    >
                      <Image source={{ uri: sanitizeImageUri(uri) }} style={styles.photoThumb} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* ── 8. Rating & Feedback ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={18} color="#F97316" />
                <Text style={styles.sectionTitle}>Feedback & Ratings</Text>
              </View>

              <View style={styles.ratingsRow}>
                {/* Subscriber Rating */}
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingLabel}>Your Rating</Text>
                  {visit.rated && visit.rating ? (
                    <View style={styles.starsWrap}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= (visit.rating || 5) ? 'star' : 'star-outline'}
                          size={16}
                          color="#F97316"
                        />
                      ))}
                      <Text style={styles.ratingScoreText}> {visit.rating}/5</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.rateNowBtn}
                      onPress={() => {
                        onClose();
                        if (onRatePress) onRatePress();
                      }}
                    >
                      <Ionicons name="star-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.rateNowBtnText}>Rate Visit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Beneficiary Rating */}
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingLabel}>Beneficiary Rating</Text>
                  {visit.beneficiaryRating !== null && visit.beneficiaryRating !== undefined ? (
                    <View style={styles.starsWrap}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= (visit.beneficiaryRating || 5) ? 'star' : 'star-outline'}
                          size={16}
                          color="#7C3AED"
                        />
                      ))}
                      <Text style={[styles.ratingScoreText, { color: '#7C3AED' }]}> {visit.beneficiaryRating}/5</Text>
                    </View>
                  ) : (
                    <Text style={styles.unratedText}>Not provided</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* ── Sticky Footer Button ── */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose} activeOpacity={0.88}>
              <Text style={styles.closeFooterBtnText}>Close Encounter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Fullscreen Photo Preview Lightbox ── */}
      <Modal
        visible={!!previewPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewPhoto(null)}>
          {previewPhoto && (
            <Image
              source={{ uri: sanitizeImageUri(previewPhoto) }}
              style={styles.previewFullImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity style={styles.previewCloseBtn} onPress={() => setPreviewPhoto(null)}>
            <Ionicons name="close-circle" size={38} color="#FFFFFF" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flexShrink: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },

  // Top Nav (Back Arrow & Close X)
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  navCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  // Header Hero area
  headerHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  encounterBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  encounterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSubText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  // Clipboard Graphic
  graphicContainer: {
    width: 74,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  graphicBlob: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F9FF',
  },
  clipboardBase: {
    width: 48,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    paddingTop: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  clipboardClip: {
    position: 'absolute',
    top: -5,
    width: 20,
    height: 8,
    backgroundColor: '#94A3B8',
    borderRadius: 4,
  },
  clipContent: {
    width: '100%',
    paddingHorizontal: 6,
    gap: 5,
    marginTop: 4,
  },
  clipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clipLine: {
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 1.5,
  },
  floatingBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Scroll Content
  scrollBody: {
    flexShrink: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // Companion Card (matching screenshot 2)
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  companionAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FE6700',
  },
  companionName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  companionRole: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 5,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Check-in / Check-out Grid
  checkInOutGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  checkBlock: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  checkBlockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  checkTimeText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typePillGeo: {
    backgroundColor: '#DCFCE7',
  },
  typePillManual: {
    backgroundColor: '#FEF3C7',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  manualNoteText: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Mood Banner
  moodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  moodEmojiContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  moodEmoji: {
    fontSize: 26,
  },
  moodHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  moodDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Vitals Grid
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vitalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Medications List
  medsList: {
    gap: 10,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medStatusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medTakenBg: {
    backgroundColor: '#DCFCE7',
  },
  medMissedBg: {
    backgroundColor: '#FEE2E2',
  },
  medItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  medItemDosage: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  medItemInstructions: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  medStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  medStatusChipTaken: {
    backgroundColor: '#DCFCE7',
  },
  medStatusChipMissed: {
    backgroundColor: '#FEE2E2',
  },
  medStatusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Observations & Notes Box
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },

  // Photos Gallery
  photosStrip: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  photoThumbWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoThumb: {
    width: 90,
    height: 90,
    backgroundColor: '#F1F5F9',
  },

  // Feedback & Ratings
  ratingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  starsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
  },
  rateNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DEEP_ORANGE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rateNowBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unratedText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // Empty Notices
  emptyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyNoticeText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    flex: 1,
  },

  // Sticky Footer Action
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  closeFooterBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFooterBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Lightbox
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFullImage: {
    width: '95%',
    height: '80%',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
  },
});

export default VisitDetailsModal;
