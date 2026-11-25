<?php
namespace Tests\Feature;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\Passwords;
class StudioTest extends TestCase {
 use RefreshDatabase;
 protected function setUp(): void { parent::setUp(); $raw=json_decode(file_get_contents(database_path('content-defaults.json')),true); $content=$raw['content'] ?? $raw; $content['clients']=[['id'=>'private','name'=>'Private client']]; $content['projects'][]=['id'=>'draft','title'=>'Private draft','published'=>false]; DB::table('studio_sites')->insert(['content'=>json_encode($content),'revision'=>1,'created_at'=>now(),'updated_at'=>now()]); }
 private function user(string $role='owner'): User { return User::create(['name'=>'Test','email'=>$role.'@example.com','role'=>$role,'password'=>Hash::make('A-private-test-passphrase'),'email_verified_at'=>now(),'security_stamp'=>'test-stamp']); }
 private function studio(User $u): static { return $this->actingAs($u)->withSession(['studio_stamp'=>$u->security_stamp]); }
 public function test_public_content_hides_clients_and_drafts(): void { $data=$this->getJson('/api/content')->assertOk()->json(); $this->assertArrayNotHasKey('clients',$data); $this->assertNotContains('draft',array_column($data['projects'],'id')); }
 public function test_guest_and_member_cannot_read_private_content(): void { $this->getJson('/api/admin/content')->assertUnauthorized(); $this->studio($this->user('member'))->getJson('/api/admin/content')->assertForbidden(); }
 public function test_login_rotates_session_and_returns_safe_user(): void { $u=$this->user(); $response=$this->postJson('/api/admin/login',['email'=>$u->email,'password'=>'A-private-test-passphrase'])->assertOk()->assertJsonPath('user.role','owner'); $this->assertArrayNotHasKey('password',$response->json('user')); $this->assertNotEmpty($response->json('csrf')); $this->getJson('/api/admin/session')->assertJsonPath('user.email',$u->email); }
 public function test_unverified_member_cannot_login(): void { $u=$this->user('member'); $u->email_verified_at=null; $u->save(); $this->postJson('/api/admin/login',['email'=>$u->email,'password'=>'A-private-test-passphrase'])->assertForbidden(); }
 public function test_editor_can_save_but_stale_revision_fails(): void { $this->studio($this->user('editor')); $item=['title'=>'New work','description'=>'Purposeful design','category'=>'digital','published'=>false]; $this->postJson('/api/admin/projects',['revision'=>1,'item'=>$item])->assertOk()->assertJsonPath('revision',2); $this->postJson('/api/admin/projects',['revision'=>1,'item'=>$item])->assertConflict(); $this->getJson('/api/admin/users')->assertForbidden(); }
 public function test_last_owner_cannot_be_demoted_or_deleted(): void { $u=$this->user(); $this->studio($u)->postJson('/api/admin/users',['id'=>$u->id,'name'=>$u->name,'email'=>$u->email,'role'=>'member'])->assertUnprocessable(); $this->deleteJson('/api/admin/users/'.$u->id)->assertUnprocessable(); }
 public function test_contact_is_validated_and_saved(): void { $this->postJson('/api/contact',['name'=>'Client','email'=>'client@example.com','service'=>'Web development','message'=>'We need a business website.'])->assertCreated(); $this->assertDatabaseCount('studio_inquiries',1); $this->postJson('/api/contact',['name'=>'Client','email'=>'bad','service'=>'Unknown','message'=>'Hi'])->assertUnprocessable(); }
 public function test_upload_rejects_svg_and_invalid_image(): void { $this->studio($this->user())->postJson('/api/admin/upload',['data'=>'data:image/svg+xml;base64,'.base64_encode('<svg/>')])->assertUnprocessable(); $this->postJson('/api/admin/upload',['data'=>'data:image/png;base64,'.base64_encode('not an image')])->assertUnprocessable(); }
 public function test_verification_is_single_use(): void { $u=$this->user('member'); $token=str_repeat('a',64); $u->forceFill(['email_verified_at'=>null,'verification_hash'=>hash('sha256',$token),'verification_expires'=>now()->addMinutes(30)])->save(); $this->get('/api/admin/verify-email?token='.$token)->assertRedirect('/login?verification=complete'); $this->get('/api/admin/verify-email?token='.$token)->assertRedirect('/login?verification=expired'); }
 public function test_identity_password_hash_upgrades(): void { $u=$this->user(); $password='Legacy-passphrase-123'; $salt=random_bytes(16); $binary=chr(1).pack('N3',2,10000,16).$salt.hash_pbkdf2('sha512',$password,$salt,10000,32,true); $u->forceFill(['password'=>base64_encode($binary),'password_scheme'=>'identity'])->save(); $this->postJson('/api/admin/login',['email'=>$u->email,'password'=>$password])->assertOk(); $this->assertSame('laravel',$u->fresh()->password_scheme); $this->assertTrue(Hash::check($password,$u->fresh()->password)); }
 public function test_legacy_scrypt_password_verification(): void { $u=$this->user(); $process=new \Symfony\Component\Process\Process([config('pixode.node_binary'),'-e',"process.stdout.write(require('crypto').scryptSync('Legacy-passphrase-123','test-salt',64).toString('hex'))"]); $process->mustRun(); $u->forceFill(['password'=>$process->getOutput(),'password_scheme'=>'legacy-scrypt','legacy_salt'=>'test-salt'])->save(); $this->assertTrue(app(Passwords::class)->verify($u,'Legacy-passphrase-123')); $this->assertFalse(app(Passwords::class)->verify($u,'wrong-password')); }
 public function test_mutation_requires_csrf_outside_test_environment(): void { $this->app->instance('env','local'); $this->postJson('/api/admin/login',['email'=>'test@example.com','password'=>'some-password'])->assertStatus(419); }
 public function test_changed_security_stamp_revokes_session(): void { $u=$this->user(); $this->studio($u); $u->security_stamp='changed'; $u->save(); $this->getJson('/api/admin/content')->assertUnauthorized(); }
 public function test_multiple_accounts_can_have_no_google_id_or_username(): void {
  foreach (['owner','editor','member'] as $role) { $user=$this->user($role); $this->assertNull($user->google_id); $this->assertNull($user->username); }
  $this->assertDatabaseCount('users',3);
 }
 public function test_valid_image_upload_is_saved_to_public_storage(): void {
  \Illuminate\Support\Facades\Storage::fake('public');
  $this->studio($this->user());
  $png=base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6XkAAAAASUVORK5CYII=');
  $url=$this->postJson('/api/admin/upload',['data'=>'data:image/png;base64,'.base64_encode($png)])->assertCreated()->json('url');
  $this->assertStringStartsWith('/uploads/',$url);
  \Illuminate\Support\Facades\Storage::disk('public')->assertExists('uploads/'.basename($url));
 }
}
