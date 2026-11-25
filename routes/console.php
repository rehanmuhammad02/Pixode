<?php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
Artisan::command('pixode:import {--source= : Legacy SQLite snapshot path}',function(){
 if(DB::table('studio_sites')->exists()) { $this->warn('Content already initialized; import skipped.'); return; }
 $source=$this->option('source') ?: storage_path('app/private/migration-source/pixode.db');
 DB::transaction(function() use($source){
 $fallback=json_decode(file_get_contents(database_path('content-defaults.json')),true); $data=$fallback['content'] ?? $fallback;
 if(is_file($source)) {
 $db=new PDO('sqlite:file:'.str_replace('\\','/',$source).'?mode=ro'); $site=$db->query('SELECT * FROM Site LIMIT 1')->fetch(PDO::FETCH_ASSOC);
 if($site){ $data=['settings'=>json_decode($site['Settings'],true)]; foreach(App\Services\StudioContent::COLLECTIONS as $c) $data[$c]=[]; foreach($db->query('SELECT * FROM Content ORDER BY Position') as $row) $data[$row['Collection']][]=json_decode($row['Payload'],true); }
 foreach($db->query('SELECT * FROM Users') as $row){ if(User::where('email',$row['Email'])->exists()) continue; User::create(['name'=>$row['Name'],'email'=>$row['Email'],'username'=>$row['Username'] ?: null,'role'=>$row['Role'],'password'=>$row['PasswordHash'],'password_scheme'=>$row['PasswordScheme'],'legacy_salt'=>$row['LegacySalt'],'verification_exempt'=>(bool)$row['VerificationExempt'],'email_verified_at'=>$row['EmailVerifiedAt'] ? now():null,'google_id'=>$row['GoogleId'],'security_stamp'=>(string)Str::uuid()]); }
 foreach($db->query('SELECT * FROM Inquiries') as $row) DB::table('studio_inquiries')->insertOrIgnore(['id'=>$row['Id'],'name'=>$row['Name'],'email'=>$row['Email'],'company'=>$row['Company'],'service'=>$row['Service'],'message'=>$row['Message'],'created_at'=>date('Y-m-d H:i:s',(int)($row['ReceivedAt']/1000)),'updated_at'=>now()]);
 }
 unset($data['revision'],$data['updatedAt']); DB::table('studio_sites')->insert(['content'=>json_encode($data),'revision'=>1,'created_at'=>now(),'updated_at'=>now()]);
 }); $this->info('Legacy SQLite snapshot imported. Current SQL Server changes are not included; export that database separately before production cutover.');
});
Artisan::command('pixode:owner {email} {--name=Pixode Owner}',function(){
 if(User::where('role','owner')->exists()){ $this->error('An owner already exists.'); return 1; }
 $password=$this->secret('Owner password (12-128 characters)'); if(strlen($password)<12 || strlen($password)>128){ $this->error('Invalid password length.'); return 1; }
 User::create(['name'=>$this->option('name'),'email'=>strtolower($this->argument('email')),'password'=>Hash::make($password),'role'=>'owner','email_verified_at'=>now(),'security_stamp'=>(string)Str::uuid()]); $this->info('Owner created.');
});

Artisan::command('pixode:sync-sqlserver {source} {--apply : Apply an exported source snapshot}',function(){
 if(!$this->option('apply')) { $this->error('Use --apply only before starting edits in Laravel. This updates the target from the SQL Server snapshot.'); return 1; }
 $raw=json_decode(file_get_contents($this->argument('source')),true,512,JSON_THROW_ON_ERROR); if(empty($raw['Site'])) { $this->error('No SQL Server site data.'); return 1; }
 DB::transaction(function() use($raw){
 $site=$raw['Site'][0]; $content=['settings'=>json_decode($site['Settings'],true)]; foreach(App\Services\StudioContent::COLLECTIONS as $key)$content[$key]=[];
 usort($raw['Content'],fn($a,$b)=>$a['Position']<=>$b['Position']); foreach($raw['Content'] as $row)$content[$row['Collection']][]=json_decode($row['Payload'],true);
 DB::table('studio_sites')->updateOrInsert(['id'=>1],['content'=>json_encode($content),'revision'=>(int)$site['Revision'],'created_at'=>now(),'updated_at'=>now()]);
 foreach($raw['Users'] as $row){ $u=User::where('email',$row['Email'])->first() ?? new User; $u->forceFill(['name'=>$row['Name'],'email'=>$row['Email'],'username'=>$row['Username'] ?: null,'role'=>$row['Role'],'password'=>$row['PasswordHash'],'password_scheme'=>$row['PasswordScheme'],'legacy_salt'=>$row['LegacySalt'],'verification_exempt'=>(bool)$row['VerificationExempt'],'email_verified_at'=>$row['EmailVerifiedAt'] ? now():null,'google_id'=>$row['GoogleId'],'verification_hash'=>null,'verification_expires'=>null,'security_stamp'=>(string)Str::uuid()])->save(); }
 foreach($raw['Inquiries'] as $row) DB::table('studio_inquiries')->updateOrInsert(['id'=>$row['Id']],['name'=>$row['Name'],'email'=>$row['Email'],'company'=>$row['Company'],'service'=>$row['Service'],'message'=>$row['Message'],'created_at'=>date('Y-m-d H:i:s',(int)($row['ReceivedAt']/1000)),'updated_at'=>now()]);
 }); $this->info('Latest SQL Server content, accounts and inquiries transferred to Laravel. Source database was not modified.');
});
