const fs = require('fs');
const file = 'frontend/src/pages/MyCoursesPage.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{enrolledCourses\.map\(\(course\) => \([\s\S]*?Continue Learning →\n[\s\S]*?<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\)\)\}/;
const newStr = `{enrolledCourses.map((item) => {
                  const course = item.course || item;
                  return (
                  <div key={course.id || Math.random()} className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-[#0F1A2E]/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/70 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-[#0F1A2E] mb-2 group-hover:text-[#E4B61A] transition-colors">{course.title}</h3>
                      <p className="text-[#0F1A2E]/60 text-sm mb-4">{course.teacher}</p>
                    </div>
                  </div>
                );
                })}`;

content = content.replace(regex, newStr);
fs.writeFileSync(file, content);
