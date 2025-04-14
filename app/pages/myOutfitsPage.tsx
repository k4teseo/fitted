import React from 'react';
import { View, Text, FlatList, Image, useWindowDimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data - replace with actual data fetching logic
const mockOutfits = [
    { id: '1', uri: `https://s3-alpha-sig.figma.com/img/fd56/c8cc/a6f9319a89631f8e4ba0478a9d744aea?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EFIubt0Dx5uLe4LBcYaYRp~3nJV5a0RzX8~z--kwcAEU-QHUVVZ5P1AYKrg7L44l4YAOvby--FWw~4DIQVQw0bj7Dy-hEK5GyKVYSeynj2rAHIvO6MDQXOYWTCyJl302fCrvVDYD7Pw-WabIrU6j3gPlBlqMmx8wuJ7I6VYuYl4ok0Dt96OqCrJxa0lX3on4eK48I8L~~IO03u1kq3D9SMEBZL4dBjgKUu4PZQuuw1U-2SUccttECjUdOV7EERx2ljA-w093nXo6eNymaC9cA9v9Bo6zK5y08Pp3TOt7LsX4BjQmOmixC~5E1DMdADFPeLN5NeQT5JOYsqPpjWQBog__` },
    { id: '2', uri: `https://s3-alpha-sig.figma.com/img/cce9/8d98/eb3254417926bdb53635ab4554de8d68?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=TQ~1FmbCrqF3smPsMrXrkJn4yZvcZZfYCd-bg8HY3FJGiwPxWsADBM6E3cMzTzXB4eIbjT9I4Qly-h4SQlJR6Dr3x5jcgTi3HjzruHuKSPkAL12317LnCMbErufi3TDMFhE3UKpEKp4QTHVWWPSGT804BLTbV3~rJH23dHJwW~zoeLVeGatTmxvLBjxGnjpcwl6qNlEY0FhlY50f6TX0x9h76xrkE8TIR~w09kYK-ejNS8RKMwBoYXjnofMQoROzrK-j6rJ3gCHmAyEHEL8Ma3FSMFlthlyDZR4LCjPE-S9O8s-uD3vcVp6nE3ONovC1VPVwWLiFGvirX0wdUo01pA__` },
    { id: '3', uri: `https://s3-alpha-sig.figma.com/img/2138/26b4/b3821b24e9cf500836d67169265c5007?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Jb47ZQbMYYS74i2l-1MmrhJe2nfONp3y~nYRthuSR~31dzD04DjwBcROr~uPVcgywsodOZjl6pLv1B-LfTZFqjo4UCt~5MYJN-~TR9uho3HyV2NuvOLY550FibtXRsdVOGEH4IYDD03jB84Y~XcFw53WcDHneBWgeZchWKpuxxpAs0ppJoXIPbboXZJBuhHV46YhD3yw2cm9s6fN-e2MspeYl7ahb0gCyUKJA6m-Up9Fl7-d9qn9mYg4iSoiuGe0Ip2qT4rYC7m7~Q1~SV4Ll6SKhXLFVnCNHRD65Mr5RsEcvXpHmPLVJ0u4KeY5V-WjMnRlQrYadcJAJp2cVN3k9w__` },
    { id: '4', uri: `https://s3-alpha-sig.figma.com/img/58ad/aff6/6669c48a303c2747a1bd1e284ca771f6?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=NSXDXPcmVU1sAjS5e4G-PtDCEV9ZYrtf7kxAZPWmdAEFUp5R5BQwcpLMZGks4c1Br6AkyHs~AYj8V2f13okY3aQ8mFpOVacQZrMmKsy5EP6F12NwgJJSUrm-SsCxhNKBVnZyG9svkHnd8IQKqueWNqGJ9XT-Riaxs59I5V0icXlJW-5ukRuU-F36F4BjaREPUriArd5fwNR~HC1wLjSeAWvgX0nL2MbWaLSfhYD22LE8FNFDpU0MCe~UuVWRxL1YSxuLve006vShEvWPllLdaxSKDN7UXA2e0Dki4J2DfudChnpkvabx8XI~f3~dGh5ELJsap4D8gjTJd1vi5VTmVw__` },
    { id: '5', uri: `https://s3-alpha-sig.figma.com/img/7643/d79e/6cc6a3a2e31372592e6337dbe38107ca?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DuCD1J-laoQbpoQrtOyRQfNchfZp4QxvAaVuB4ZgRKPL~oY4D7Yx~nlQ4hAJyznLE0zEmGum~BLUCzLur65cjnVhv7Pw1WLYsAJunSXT15LonuXu7E81XQBcivpUU7QV4A64vIwe03n6itquyJanOMfS6OO0qaX2~9AVWULGginy7ULCqtmGz4aRTtWO1sVkL5j4pujknrCb1XJleylA0xD3~1gZPpEZ~f-c~0DZG9NMyA9C6WgGBfL-TxiJi~N3fEMr2GijKC2fIdaN3pCLBqgl8LsaYPCxfDWQ7iWo9BCiK7QMXJbEOFVpzqGCKN3k9p2UdzkRo7zrPfel9TdFGQ__` },
    { id: '6', uri: `https://s3-alpha-sig.figma.com/img/20f6/fa5d/29bc8190de8553ab19ae1777f485b772?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=AY2qLB8~S3yOZ4zyZGTzjYPJ~Zv4lH-5PcYh08C4T~YiQxGNU6YhBuvLkZAMyZcDXn8K~yWa7d5jdvsMWFzS91UI51wX7tdT18wDPet3uzECTlNF~UxrS6Oy81bHBChTZs~YLYf5tJ67LS~O~VsH-SLTXdO07KlyVEZFrxc~jtfMwsLJp-RTaYlJ7PhXTvXeZAz8W9Ckpb94de9EVJi~prT6UEcgOscixTP~FZ4R07WKObTB29ADSV4HNHs8QmyqTbjPCNGRjJxZxI1aPf5oEiuZ3zR85ylRvnTnex4DkuZkGlxVzDrlvXK~4HqXDiDerkAi~3yX83zL8jSwzdLq3Q__` },
    { id: '7', uri: `https://s3-alpha-sig.figma.com/img/0cae/a707/71963fc82ad6ab83b9cce85111339cae?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=rWlBnOXErcl3n06OUPdCTAJRLyg0iQAleCo80O1fwdCfWQ~bn4VVzt1iWHb2nLv0C6n~mg1z1iGfBUroBj7Dg4UixCa48ffTs7ClDAKPvVtfGlPgbbpUJFFnCy5VFEgqsFxn7ttAmeR59g0NDO3FXwayuQ6JHjd4KH69elmOlI-LwPWbzOKz-2nzxu-GSExebvpkxaWqsPtOouCbghjhdTGaejMtRrDGsgv2HjPe8uyC~Y9dYLCeH7AUdPgB1aKDzthDklzec8uxo4NPUczHl8blTRtC14dFJA6QF8tvKTep9hmhJClDHhLEI8Sy9JMJe~gAQi8j6zm9-Z7yx2AiQQ__` },
    { id: '8', uri: `https://s3-alpha-sig.figma.com/img/3bd6/09c6/66e45e8ce3e828e99179a0a47dc07147?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=ZIM~Z~fV1B3zRjcqWJdp~W-97ek96PBxqj5srCqK2E81ZbHzBBH1t46kOzck7uQuU-MzWfjrGJ5X6L0bhcbkQqEbSVO~t4uFYoh2QnvQT1QNdUajbjwEbbnvpEwBt9gq4wVOIptQ2RjHC~kSoGe2ScKLIM2GseLWqmUP9Qb4v9ZhwmyUQOnqQ-vn8azTcinY-nisUXRN~OKTij0H2khmVo3mblZvpWZgJU5-D5-oFp-aUrQhJ47zw3BYvAZkWmYu0sE5Gw9T-pa8mLd8US5-44ei9Jk~h7iwndzTCdIkn6ymWuecEh4Yqg0FlYcs8BOoFrBPsQ17fchB3NmGBt3EBQ__` },
    { id: '9', uri: 'https://s3-alpha-sig.figma.com/img/f48b/4bb9/db0c588da0c73626502866ac137d9f70?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=AyhqGNL4b3tC5yubxnE8QiPPtFxLqlsNEY6Wn-zEeQYZ1KD-BGQ0NdopA7kImMjdIX0dWDLvnWj0XawImr2kdxkmjFKxk42zVMo~xA9mMcg9qdbKs7xkN1yiPbB1aMfUnIWBztB0XfL25CUGgvkCa2-h7JUjjPjNXIf6f2FrrzXvfj8MXfuihv-0LBnw7djfOomHiwLkVRBvkaFxqApO22c0AiTIVViM4~mI~Erzo33C3ZMl2lldSmKwu7Hkadcii4Be9cN4Gc~FBK1JgJedposzWSIEAuG151AAJheFi6o-m1vSFbBay~~gjjZgnvgaA9KluLf9sfZK3QO7N1W2kw__' },
];

  export default function MyOutfitsPage() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { userId } = useLocalSearchParams();

    // Calculate item width for 3 columns with padding
    const itemWidth = (width - 32 - 16) / 3; // 32 = horizontal padding, 16 = gap

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#15181B',
            padding: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        backButton: {
            marginTop: 55,
            marginRight: 15,
            marginBottom: 20,
        },
        title: {
            color: '#C7D1DB',
            fontSize: 20,
            fontWeight: '600',
            marginTop: 55,
            marginBottom: 20,
        },
        grid: {
            flex: 1,
        },
        columnWrapper: {
            justifyContent: 'space-between',
            marginBottom: 8, // Reduced gap between rows
        },
        outfitItem: {
            width: itemWidth,
            aspectRatio: 0.8,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 3, // Gap between items
        },
        outfitImage: {
            width: '100%',
            height: '100%',
            backgroundColor: '#333',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>My Outfits</Text>
            </View>

            <FlatList
                data={mockOutfits}
                renderItem={({ item }) => (
                    <View style={styles.outfitItem}>
                        <Image 
                            source={{ uri: item.uri }} 
                            style={styles.outfitImage}
                            resizeMode="cover"
                        />
                    </View>
                )}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.grid}
            />
        </View>
    );
}