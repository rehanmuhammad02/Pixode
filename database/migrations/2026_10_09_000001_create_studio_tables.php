<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
 Schema::table('users', function(Blueprint $t) { $t->string('username')->nullable()->unique(); $t->string('role')->default('member'); $t->boolean('verification_exempt')->default(false); $t->string('password_scheme')->default('laravel'); $t->string('legacy_salt')->nullable(); $t->string('google_id')->nullable()->unique(); $t->string('security_stamp')->nullable(); $t->string('verification_hash')->nullable(); $t->timestamp('verification_expires')->nullable(); });
 Schema::create('studio_sites', function(Blueprint $t) { $t->id(); $t->json('content'); $t->unsignedBigInteger('revision')->default(1); $t->timestamps(); });
 Schema::create('studio_inquiries', function(Blueprint $t) { $t->uuid('id')->primary(); $t->string('name'); $t->string('email'); $t->string('company')->default(''); $t->string('service'); $t->text('message'); $t->timestamps(); });
 }
 public function down(): void { Schema::dropIfExists('studio_inquiries'); Schema::dropIfExists('studio_sites'); Schema::table('users',fn(Blueprint $t)=>$t->dropColumn(['username','role','verification_exempt','password_scheme','legacy_salt','google_id','security_stamp','verification_hash','verification_expires'])); }
};
