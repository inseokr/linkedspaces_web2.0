import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Link } from "expo-router";

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkTitle?: string;
}

export function SectionHeader({ title, href, linkTitle }: SectionHeaderProps) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isWeb && styles.titleWeb]}>{title}</Text>
      {href && (
        <Link href={href as any} asChild>
          <TouchableOpacity>
            <Text style={styles.link}>{linkTitle || "View All"}</Text>
          </TouchableOpacity>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  titleWeb: {
    fontSize: 28,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
});
