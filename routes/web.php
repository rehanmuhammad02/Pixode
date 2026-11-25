<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController as A;
use App\Http\Controllers\StudioController as S;
Route::get('/api/content',[S::class,'publicContent']);
Route::post('/api/contact',[S::class,'contact'])->middleware('throttle:5,1');
Route::prefix('api/admin')->group(function(){
 Route::get('session',[A::class,'session']); Route::get('auth-options',[A::class,'options']);
 Route::post('login',[A::class,'login'])->middleware('throttle:10,1');
 Route::post('signup',[A::class,'signup'])->middleware('throttle:5,1');
 Route::post('resend-verification',[A::class,'resend'])->middleware('throttle:3,1');
 Route::get('verify-email',[A::class,'verify']); Route::get('google/start',[A::class,'googleStart']); Route::get('google/callback',[A::class,'googleCallback']);
 Route::post('logout',[A::class,'logout'])->middleware('studio:member');
 Route::middleware('studio:owner')->group(function(){ Route::get('users',[A::class,'users']); Route::post('users',[A::class,'saveUser']); Route::delete('users/{id}',[A::class,'deleteUser']); Route::post('users/{id}/verification',[A::class,'invite']); });
 Route::middleware('studio')->group(function(){ Route::get('content',[S::class,'content']); Route::get('inquiries',[S::class,'inquiries']); Route::post('upload',[S::class,'upload'])->middleware('throttle:20,1'); Route::put('settings',[S::class,'settings']); Route::post('{collection}',[S::class,'save']); Route::delete('{collection}/{id}',[S::class,'delete']); });
});
Route::get('/uploads/{name}',function(string $name){ abort_unless(preg_match('/^[a-f0-9-]+\.(png|jpg|webp)$/',$name),404); $p=storage_path('app/public/uploads/'.$name); abort_unless(is_file($p),404); return response()->file($p,['X-Content-Type-Options'=>'nosniff']); });
Route::get('/{path?}',fn()=>view('studio'))->where('path','^(?!api(?:/|$)|storage(?:/|$)|uploads(?:/|$)).*');



Route::get('/run-migration-secret-xyz', function () {
    try {
        Artisan::call('migrate');
        return 'Migration Successful! Output: ' . Artisan::output();
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});