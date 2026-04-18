import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme, hexToRGBA } from '../theme/colors';

/**
 * CustomButton - Tombol Modern dengan Branding AOne
 * @param {string} title - Teks tombol
 * @param {function} onPress - Action saat ditekan
 * @param {string} type - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {object} icon - Komponen icon (optional)
 * @param {boolean} loading - State loading
 * @param {boolean} disabled - State disable
 */
export default function CustomButton({ 
  title, 
  onPress, 
  type = 'primary', 
  icon: Icon, 
  loading = false, 
  disabled = false,
  style 
}) {
  
  // Logic penentuan warna berdasarkan type
  const getStyles = () => {
    switch (type) {
      case 'secondary':
        return { 
          bg: Theme.card, 
          text: Theme.textMain, 
          border: Theme.border 
        };
      case 'danger':
        return { 
          bg: hexToRGBA(Theme.danger, 0.2), 
          text: Theme.danger, 
          border: Theme.danger 
        };
      case 'ghost':
        return { 
          bg: 'transparent', 
          text: Theme.accent, 
          border: 'transparent' 
        };
      default: // Primary
        return { 
          bg: Theme.primary, 
          text: Theme.background, 
          border: Theme.primary 
        };
    }
  };

  const buttonStyle = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base, 
        { backgroundColor: buttonStyle.bg, borderColor: buttonStyle.border },
        disabled && { opacity: 0.5 },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={buttonStyle.text} size="small" />
      ) : (
        <View style={styles.content}>
          {Icon && <View style={styles.iconWrapper}><Icon color={buttonStyle.text} size={18} strokeWidth={2.5} /></View>}
          <Text style={[styles.text, { color: buttonStyle.text }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});