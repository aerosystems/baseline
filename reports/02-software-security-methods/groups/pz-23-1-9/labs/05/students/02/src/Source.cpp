#include <iostream>
#include <cstdint>
#include <bitset>

uint64_t permute(uint64_t input, const int* table, int n, int inputBits) {
    uint64_t output = 0;
    for (int i = 0; i < n; i++) {
        uint64_t bit = (input >> (inputBits - table[i])) & 1;
        output |= (bit << (n - 1 - i));
    }
    return output;
}

uint32_t leftRotate28(uint32_t value, int shift) {
    return ((value << shift) | (value >> (28 - shift))) & 0x0FFFFFFF;
}

void printHex64(const char* label, uint64_t value) {
    std::cout << label << ": " << std::hex << std::uppercase;
    for (int i = 15; i >= 0; i--) std::cout << ((value >> (i * 4)) & 0xF);
    std::cout << std::dec << std::endl;
}

void printBin64(const char* label, uint64_t value) {
    std::cout << label << ": " << std::bitset<64>(value) << std::endl;
}

const int IP[64] = {
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7
};

const int IP_INV[64] = {
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9, 49, 17, 57, 25
};

const int E[48] = {
    32, 1, 2, 3, 4, 5,
    4, 5, 6, 7, 8, 9,
    8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32, 1
};

const int P[32] = {
    16, 7, 20, 21, 29, 12, 28, 17,
    1, 15, 23, 26, 5, 18, 31, 10,
    2, 8, 24, 14, 32, 27, 3, 9,
    19, 13, 30, 6, 22, 11, 4, 25
};

const int S[8][64] = {
    {14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,
     0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,
     4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,
     15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13},
    {15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,
     3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,
     0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,
     13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9},
    {10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,
     13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,
     13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,
     1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12},
    {7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,
     13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,
     10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,
     3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14},
    {2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,
     14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,
     4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,
     11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3},
    {12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,
     10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,
     9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,
     4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13},
    {4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,
     13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,
     1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,
     6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12},
    {13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,
     1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,
     7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,
     2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11}
};

const int PC1[56] = {
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4
};

const int PC2[48] = {
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32
};

const int SHIFTS[16] = {1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1};

uint32_t f_function(uint32_t R, uint64_t K) {
    uint64_t xored = permute(R, E, 48, 32) ^ K;
    uint32_t sBoxOutput = 0;
    for (int i = 0; i < 8; i++) {
        int sixBits = (xored >> (42 - i * 6)) & 0x3F;
        int row = ((sixBits >> 5) << 1) | (sixBits & 1);
        int col = (sixBits >> 1) & 0x0F;
        sBoxOutput |= (uint32_t)S[i][row * 16 + col] << (28 - i * 4);
    }
    return (uint32_t)permute(sBoxOutput, P, 32, 32);
}

void generateSubkeys(uint64_t key, uint64_t subkeys[16]) {
    uint64_t permutedKey = permute(key, PC1, 56, 64);
    uint32_t C = (permutedKey >> 28) & 0x0FFFFFFF;
    uint32_t D = permutedKey & 0x0FFFFFFF;
    for (int i = 0; i < 16; i++) {
        C = leftRotate28(C, SHIFTS[i]);
        D = leftRotate28(D, SHIFTS[i]);
        subkeys[i] = permute(((uint64_t)C << 28) | D, PC2, 48, 56);
    }
}

uint64_t des_encrypt(uint64_t plaintext, uint64_t key, uint64_t rounds[16] = nullptr) {
    uint64_t subkeys[16];
    generateSubkeys(key, subkeys);
    uint64_t permuted = permute(plaintext, IP, 64, 64);
    uint32_t L = (permuted >> 32) & 0xFFFFFFFF;
    uint32_t R = permuted & 0xFFFFFFFF;
    for (int i = 0; i < 16; i++) {
        uint32_t temp = R;
        R = L ^ f_function(R, subkeys[i]);
        L = temp;
        if (rounds) rounds[i] = ((uint64_t)L << 32) | R;
    }
    return permute(((uint64_t)R << 32) | L, IP_INV, 64, 64);
}

int countBits(uint64_t x) {
    return (int)std::bitset<64>(x).count();
}

int main() {
    uint64_t plaintext = 0x0123456789ABCDEF;
    uint64_t key = 0x133457799BBCDFF1;
    int flipPos = 2;

    uint64_t modified = plaintext ^ (1ULL << (64 - flipPos));

    uint64_t rounds1[16], rounds2[16];
    uint64_t c1 = des_encrypt(plaintext, key, rounds1);
    uint64_t c2 = des_encrypt(modified, key, rounds2);

    std::cout << "=== DES Avalanche Effect ===" << std::endl << std::endl;
    printHex64("Key           ", key);
    printHex64("Plaintext 1   ", plaintext);
    printHex64("Plaintext 2   ", modified);
    std::cout << "Flipped bit   : " << flipPos << std::endl << std::endl;

    printBin64("P1", plaintext);
    printBin64("P2", modified);
    printBin64("X ", plaintext ^ modified);
    std::cout << "Differing bits in plaintext: " << countBits(plaintext ^ modified) << std::endl << std::endl;

    printHex64("Ciphertext 1  ", c1);
    printHex64("Ciphertext 2  ", c2);
    printBin64("C1", c1);
    printBin64("C2", c2);
    printBin64("X ", c1 ^ c2);

    int diff = countBits(c1 ^ c2);
    std::cout << "Differing bits in ciphertext: " << diff << " of 64 ("
              << diff * 100.0 / 64 << "%)" << std::endl << std::endl;

    std::cout << "Difference propagation by round:" << std::endl;
    for (int i = 0; i < 16; i++) {
        int d = countBits(rounds1[i] ^ rounds2[i]);
        std::cout << "Round " << (i + 1 < 10 ? " " : "") << i + 1 << ": "
                  << (d < 10 ? " " : "") << d << " | " << std::string(d, '#') << std::endl;
    }

    std::cout << std::endl << "Flipping each of the 64 plaintext bits:" << std::endl;
    int minD = 64, maxD = 0, sum = 0;
    for (int pos = 1; pos <= 64; pos++) {
        uint64_t c = des_encrypt(plaintext ^ (1ULL << (64 - pos)), key);
        int d = countBits(c1 ^ c);
        sum += d;
        if (d < minD) minD = d;
        if (d > maxD) maxD = d;
    }
    std::cout << "Min: " << minD << ", max: " << maxD
              << ", avg: " << sum / 64.0 << " bits" << std::endl;

    return 0;
}
