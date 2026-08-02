<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BiologyTeachersSeeder extends Seeder
{
    private $maleFirstNames = [
        'Akbar', 'Aziz', 'Bekzod', 'Botir', 'Davron', 'Dilmurod', 'Eldor', 'Farhod', 'Fozil', 'G\'ayrat', 
        'Hasan', 'Husan', 'Ibrohim', 'Ilhom', 'Jahongir', 'Jamshid', 'Jasur', 'Komil', 'Mansur', 'Murod', 
        'Nodir', 'Odil', 'Olim', 'Oybek', 'Qodir', 'Rustam', 'Sanjar', 'Sardor', 'Sherzod', 'Shuhrat', 
        'Timur', 'Tohir', 'Ulug\'bek', 'Umid', 'Vali', 'Xurshid', 'Zafar', 'Zokir'
    ];

    private $femaleFirstNames = [
        'Aziza', 'Barno', 'Charos', 'Dilbar', 'Dildora', 'Dilnoza', 'Feruza', 'Fotima', 'Gozal', 'Gulnoza', 
        'Hadicha', 'Iroda', 'Jamila', 'Kamola', 'Lola', 'Madina', 'Malika', 'Mavluda', 'Mohira', 'Munisa', 
        'Nargiza', 'Nigora', 'Nilufar', 'Nodira', 'Nozima', 'Odinaxon', 'Rano', 'Rayhon', 'Saida', 'Salima', 
        'Sevara', 'Shahnoza', 'Shohida', 'Umida', 'Vazira', 'Yulduz', 'Zarina', 'Ziyoda', 'Zuhra'
    ];

    private $lastNameRoots = [
        'Abdulla', 'Ahror', 'Akram', 'Alisher', 'Asatulla', 'Aziz', 'Botir', 'Davlat', 'Ergash', 'Fayzi', 
        'G\'afur', 'Habib', 'Hasan', 'Husan', 'Ibrohim', 'Ismoil', 'Jalil', 'Juma', 'Karim', 'Mahmud', 
        'Mansur', 'Mirza', 'Murod', 'Nazar', 'Nemat', 'Nizom', 'Odil', 'Olim', 'Omon', 'Qodir', 'Qosim', 
        'Rahim', 'Rahmon', 'Rasul', 'Rustam', 'Safar', 'Said', 'Samad', 'Sherali', 'Shuhrat', 'Sodiq', 
        'Tohir', 'Tosh', 'Tursun', 'Umar', 'Usmon', 'Vali', 'Xalil', 'Yoqub', 'Ziyod', 'Zokir'
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regionsData = [
            'andijon' => [
                'tajriba' => ['total' => 83, 'female' => 60, 'male' => 23, 'shahar' => 40, 'qishloq' => 43, 'avg_exp' => 14.2],
                'nazorat' => ['total' => 77, 'female' => 57, 'male' => 20, 'shahar' => 36, 'qishloq' => 41, 'avg_exp' => 13.8],
            ],
            'namangan' => [
                'tajriba' => ['total' => 78, 'female' => 55, 'male' => 23, 'shahar' => 53, 'qishloq' => 25, 'avg_exp' => 13.9],
                'nazorat' => ['total' => 72, 'female' => 53, 'male' => 19, 'shahar' => 48, 'qishloq' => 24, 'avg_exp' => 14.1],
            ],
            'sirdaryo' => [
                'tajriba' => ['total' => 50, 'female' => 34, 'male' => 16, 'shahar' => 11, 'qishloq' => 39, 'avg_exp' => 13.5],
                'nazorat' => ['total' => 77, 'female' => 55, 'male' => 22, 'shahar' => 18, 'qishloq' => 59, 'avg_exp' => 14.3],
            ]
        ];

        $usersToInsert = [];
        $emailCounter = 1;

        $passwordHash = Hash::make('password123');

        foreach ($regionsData as $region => $groups) {
            foreach ($groups as $group => $data) {
                
                $genders = array_merge(array_fill(0, $data['female'], 'ayol'), array_fill(0, $data['male'], 'erkak'));
                shuffle($genders);

                $locations = array_merge(array_fill(0, $data['shahar'], 'shahar'), array_fill(0, $data['qishloq'], 'qishloq'));
                shuffle($locations);

                $experiences = $this->generateExperiences($data['total'], $data['avg_exp']);
                shuffle($experiences);

                for ($i = 0; $i < $data['total']; $i++) {
                    $gender = $genders[$i];
                    
                    if ($gender === 'erkak') {
                        $firstName = $this->maleFirstNames[array_rand($this->maleFirstNames)];
                        $lastNameRoot = $this->lastNameRoots[array_rand($this->lastNameRoots)];
                        $lastName = $lastNameRoot . (rand(0, 1) ? 'ov' : 'yev');
                    } else {
                        $firstName = $this->femaleFirstNames[array_rand($this->femaleFirstNames)];
                        $lastNameRoot = $this->lastNameRoots[array_rand($this->lastNameRoots)];
                        $lastName = $lastNameRoot . (rand(0, 1) ? 'ova' : 'yeva');
                    }
                    
                    $name = $firstName . ' ' . $lastName;
                    $cleanFirstName = strtolower(preg_replace('/[^a-zA-Z]/', '', str_replace('\'', '', $firstName)));
                    $cleanLastName = strtolower(preg_replace('/[^a-zA-Z]/', '', str_replace('\'', '', $lastName)));
                    
                    $email = $cleanFirstName . '.' . $cleanLastName . $emailCounter . '@sanotaf.edu';
                    $emailCounter++;

                    $usersToInsert[] = [
                        'name' => $name,
                        'email' => $email,
                        'password' => $passwordHash,
                        'region' => $region,
                        'position' => 'Biologiya o\'qituvchisi',
                        'gender' => $gender,
                        'school_location' => $locations[$i],
                        'pedagogical_experience' => $experiences[$i],
                        'group' => $group,
                        'role' => 'user', 
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        foreach ($usersToInsert as $user) {
            try {
                User::create($user);
            } catch (\Exception $e) {
                echo $e->getMessage() . "\n";
                break;
            }
        }
    }

    private function generateExperiences($count, $targetAverage)
    {
        $targetSum = round($count * $targetAverage);
        $experiences = array_fill(0, $count, round($targetAverage));

        $currentSum = array_sum($experiences);
        $diff = $targetSum - $currentSum;

        while ($diff != 0) {
            $idx = array_rand($experiences);
            if ($diff > 0 && $experiences[$idx] < 40) {
                $experiences[$idx]++;
                $diff--;
            } elseif ($diff < 0 && $experiences[$idx] > 1) {
                $experiences[$idx]--;
                $diff++;
            }
        }

        // Add some variance
        $varianceSteps = $count * 3;
        for ($i = 0; $i < $varianceSteps; $i++) {
            $idx1 = array_rand($experiences);
            $idx2 = array_rand($experiences);
            if ($experiences[$idx1] < 40 && $experiences[$idx2] > 1) {
                $experiences[$idx1]++;
                $experiences[$idx2]--;
            }
        }

        return $experiences;
    }
}
