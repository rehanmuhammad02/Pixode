<?php
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$path = storage_path('app/private/preview-account.json');
$action = $argv[1] ?? '';
if ($action === 'prepare') {
    if (is_file($path)) throw new RuntimeException('Clean up the previous preview account first.');
    $password = bin2hex(random_bytes(24));
    $email = 'preview-'.bin2hex(random_bytes(6)).'@example.test';
    $user = \App\Models\User::create(['name'=>'Preview reviewer', 'email'=>$email, 'role'=>'editor', 'password'=>\Illuminate\Support\Facades\Hash::make($password), 'password_scheme'=>'laravel', 'email_verified_at'=>now(), 'security_stamp'=>(string)\Illuminate\Support\Str::uuid()]);
    file_put_contents($path, json_encode(['id'=>$user->id, 'email'=>$email, 'password'=>$password], JSON_THROW_ON_ERROR));
    echo "Temporary preview account prepared; credentials kept in private storage.\n";
} elseif ($action === 'cleanup' && is_file($path)) {
    $data = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
        $user = \App\Models\User::where('id', $data['id'])->where('email', $data['email'])->where('role', 'editor')->firstOrFail();
        \Illuminate\Support\Facades\DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->delete();
    });
    unlink($path);
    echo "Temporary preview account and sessions removed.\n";
} else { throw new RuntimeException('Use prepare or cleanup.'); }