import { StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Platform, View, Text } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';


export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <ThemedText style={styles.title}>
            Declare Your New Mindset
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Track your daily declarations
          </ThemedText>
        </View>

        <ThemedView style={styles.featureGrid}>
          <Link href="/(tabs)/counter" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <View style={styles.featureTextContainer}>
                  <ThemedView style={styles.iconContainer}>
                    <Ionicons name="stopwatch-outline" size={32} color="blue" /> {/*Example themed color*/}
                  </ThemedView>
                  <ThemedText style={styles.featureText}>Declaration Counter</ThemedText>
                </View>
                <View style={styles.featureDescriptionContainer}>
                  <ThemedText style={styles.featureDescription}>
                    Track your progress
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevron} /> {/*Example themed color*/}
                </View>
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/podcast" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <View style={styles.featureTextContainer}>
                  <ThemedView style={styles.iconContainer}>
                    <Ionicons name="mic-outline" size={32} color="orange" /> {/*Example themed color*/}
                  </ThemedView>
                  <ThemedText style={styles.featureText}>Podcast</ThemedText>
                </View>
                <View style={styles.featureDescriptionContainer}>
                  <ThemedText style={styles.featureDescription}>
                    Listen to spiritual teachings
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevron} /> {/*Example themed color*/}
                </View>
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/blog" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <View style={styles.featureTextContainer}>
                  <ThemedView style={styles.iconContainer}>
                    <Ionicons name="newspaper-outline" size={32} color="green" /> {/*Example themed color*/}
                  </ThemedView>
                  <ThemedText style={styles.featureText}>Blog</ThemedText>
                </View>
                <View style={styles.featureDescriptionContainer}>
                  <ThemedText style={styles.featureDescription}>
                    Inspiration for your journey
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevron} /> {/*Example themed color*/}
                </View>
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/declarations" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <View style={styles.featureTextContainer}>
                  <ThemedView style={styles.iconContainer}>
                    <Ionicons name="book-outline" size={32} color="red" /> {/*Example themed color*/}
                  </ThemedView>
                  <ThemedText style={styles.featureText}>Daily Declarations</ThemedText>
                </View>
                <View style={styles.featureDescriptionContainer}>
                  <ThemedText style={styles.featureDescription}>
                    Speak life over yourself
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevron} /> {/*Example themed color*/}
                </View>
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/stats" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <View style={styles.featureTextContainer}>
                  <ThemedView style={[styles.iconContainer, { backgroundColor: 'rgba(74, 144, 226, 0.2)' }]}>
                    <Ionicons name="stats-chart" size={32} color="blue" /> {/*Example themed color*/}
                  </ThemedView>
                  <ThemedText style={styles.featureText}>Statistics</ThemedText>
                </View>
                <View style={styles.featureDescriptionContainer}>
                  <ThemedText style={styles.featureDescription}>
                    View your progress
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevron} /> {/*Example themed color*/}
                </View>
              </BlurView>
            </TouchableOpacity>
          </Link>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: 'lightgray' }]}> {/*Example themed backgroundColor*/}
          <ThemedText style={styles.cardTitle}>About Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            Igniting Hope Ministries focuses on helping people renew their minds and transform their beliefs through daily declarations.
          </ThemedText>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://ignitinghope.com')}>
            <ThemedText style={styles.linkText}>Visit our website</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="blue" /> {/*Example themed color*/}
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.socialsContainer}>
          <ThemedText style={styles.socialsTitle}>Find Us Online</ThemedText>
          <View style={styles.socialsIconsContainer}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/ignitinghope')}>
              <View style={[styles.socialIcon, { backgroundColor: 'blue' }]}> {/*Example themed backgroundColor*/}
                <FontAwesome name="facebook-f" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/ignitinghope/')}>
              <View style={[styles.socialIcon, { backgroundColor: 'red' }]}> {/*Example themed backgroundColor*/}
                <FontAwesome name="instagram" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/IgnitingHopeMinistries')}>
              <View style={[styles.socialIcon, { backgroundColor: 'red' }]}> {/*Example themed backgroundColor*/}
                <FontAwesome name="youtube-play" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://x.com/BacklundSteve')}>
              <View style={[styles.socialIcon, { backgroundColor: 'black' }]}> {/*Example themed backgroundColor*/}
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" fill="white" />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
        </ThemedView>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'column',
    marginBottom: 30,
  },
  featureButtonWrapper: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureButton: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    paddingRight: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  featureTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.45,
  },
  featureText: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'left',
    flexShrink: 1,
  },
  featureDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 0.55,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    textAlign: 'right',
    paddingRight: 10,
    flexShrink: 1,
  },
  chevron: {
    position: 'absolute',
    right: 8,
    alignSelf: 'center',
    opacity: 0.6,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontWeight: '600',
    fontSize: 15,
    marginRight: 6,
  },
  socialsContainer: {
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  socialsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  socialsIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});